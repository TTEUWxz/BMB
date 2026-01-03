import requests
import sys
import json
from datetime import datetime, timedelta
from uuid import uuid4

class AutoSpaAPITester:
    def __init__(self, base_url="https://autoesthetic.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)

            success = response.status_code == expected_status
            
            if success:
                print(f"   Status: {response.status_code} ✅")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"   Status: {response.status_code} ❌ (Expected {expected_status})")
                print(f"   Response: {response.text[:200]}...")

            self.log_test(name, success, f"Status {response.status_code}, Expected {expected_status}")
            return success, response.json() if success and response.text else {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   Error: {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_init_services(self):
        """Test service initialization"""
        return self.run_test("Initialize Services", "POST", "init-services", 200)

    def test_get_services(self):
        """Test getting services"""
        success, response = self.run_test("Get Services", "GET", "services", 200)
        if success and isinstance(response, list) and len(response) == 4:
            print(f"   Found {len(response)} services ✅")
            # Verify service structure
            required_fields = ['id', 'name', 'description', 'price', 'duration_minutes', 'image_url']
            for service in response:
                missing_fields = [field for field in required_fields if field not in service]
                if missing_fields:
                    self.log_test("Service Structure Validation", False, f"Missing fields: {missing_fields}")
                    return False, response
            self.log_test("Service Structure Validation", True)
        return success, response

    def test_get_timeslots(self):
        """Test getting available timeslots"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        success, response = self.run_test("Get Timeslots", "GET", "timeslots", 200, params={"date": tomorrow})
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} timeslots ✅")
            # Verify timeslot structure
            for slot in response:
                if 'time' not in slot or 'available' not in slot:
                    self.log_test("Timeslot Structure Validation", False, "Missing time or available field")
                    return False, response
            self.log_test("Timeslot Structure Validation", True)
        return success, response

    def test_create_booking(self):
        """Test creating a booking"""
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        # First get available timeslots
        timeslots_success, timeslots = self.test_get_timeslots()
        if not timeslots_success or not timeslots:
            return False, {}
        
        # Find first available slot
        available_slot = None
        for slot in timeslots:
            if slot.get('available', False):
                available_slot = slot['time']
                break
        
        if not available_slot:
            self.log_test("Create Booking", False, "No available timeslots found")
            return False, {}

        booking_data = {
            "service_id": "lavagem-simples",
            "customer_name": f"Test Customer {uuid4().hex[:8]}",
            "customer_phone": "(11) 99999-9999",
            "customer_email": f"test{uuid4().hex[:8]}@example.com",
            "vehicle_model": "Honda Civic 2020",
            "vehicle_plate": f"ABC{uuid4().hex[:4].upper()}",
            "date": tomorrow,
            "time": available_slot
        }

        success, response = self.run_test("Create Booking", "POST", "bookings", 200, data=booking_data)
        
        if success and 'id' in response:
            print(f"   Booking ID: {response['id']} ✅")
            return success, response
        return success, response

    def test_get_bookings(self):
        """Test getting all bookings"""
        return self.run_test("Get All Bookings", "GET", "bookings", 200)

    def test_get_bookings_by_status(self):
        """Test filtering bookings by status"""
        return self.run_test("Get Pending Bookings", "GET", "bookings", 200, params={"status": "pending"})

    def test_get_booking_by_id(self, booking_id):
        """Test getting a specific booking"""
        return self.run_test("Get Booking by ID", "GET", f"bookings/{booking_id}", 200)

    def test_update_booking_status(self, booking_id):
        """Test updating booking status"""
        return self.run_test("Update Booking Status", "PATCH", f"bookings/{booking_id}", 200, 
                           data={"status": "confirmed"})

    def test_time_conflict_validation(self):
        """Test that the system prevents double booking"""
        tomorrow = (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d')
        
        # Get available timeslots
        timeslots_success, timeslots = self.run_test("Get Timeslots for Conflict Test", "GET", "timeslots", 200, params={"date": tomorrow})
        if not timeslots_success or not timeslots:
            return False, {}
        
        # Find first available slot
        available_slot = None
        for slot in timeslots:
            if slot.get('available', False):
                available_slot = slot['time']
                break
        
        if not available_slot:
            self.log_test("Time Conflict Test", False, "No available timeslots found")
            return False, {}

        # Create first booking
        booking_data_1 = {
            "service_id": "lavagem-simples",
            "customer_name": f"Test Customer 1 {uuid4().hex[:8]}",
            "customer_phone": "(11) 99999-9999",
            "customer_email": f"test1{uuid4().hex[:8]}@example.com",
            "vehicle_model": "Honda Civic 2020",
            "vehicle_plate": f"ABC{uuid4().hex[:4].upper()}",
            "date": tomorrow,
            "time": available_slot
        }

        success1, response1 = self.run_test("Create First Booking", "POST", "bookings", 200, data=booking_data_1)
        
        if not success1:
            return False, {}

        # Try to create second booking at same time (should fail)
        booking_data_2 = {
            "service_id": "lavagem-detalhada",
            "customer_name": f"Test Customer 2 {uuid4().hex[:8]}",
            "customer_phone": "(11) 88888-8888",
            "customer_email": f"test2{uuid4().hex[:8]}@example.com",
            "vehicle_model": "Toyota Corolla 2021",
            "vehicle_plate": f"XYZ{uuid4().hex[:4].upper()}",
            "date": tomorrow,
            "time": available_slot
        }

        success2, response2 = self.run_test("Create Conflicting Booking (Should Fail)", "POST", "bookings", 400, data=booking_data_2)
        
        if success2:  # This should fail (return 400)
            self.log_test("Time Conflict Validation", True, "Correctly prevented double booking")
            return True, response2
        else:
            self.log_test("Time Conflict Validation", False, "Failed to prevent double booking")
            return False, {}

def main():
    print("🚀 Starting Auto Spa Booking System API Tests\n")
    
    tester = AutoSpaAPITester()
    
    # Test sequence
    print("=" * 60)
    print("BASIC API TESTS")
    print("=" * 60)
    
    # Basic API tests
    tester.test_api_root()
    tester.test_init_services()
    services_success, services = tester.test_get_services()
    tester.test_get_timeslots()
    
    print("\n" + "=" * 60)
    print("BOOKING WORKFLOW TESTS")
    print("=" * 60)
    
    # Booking workflow tests
    booking_success, booking = tester.test_create_booking()
    tester.test_get_bookings()
    tester.test_get_bookings_by_status()
    
    if booking_success and 'id' in booking:
        booking_id = booking['id']
        tester.test_get_booking_by_id(booking_id)
        tester.test_update_booking_status(booking_id)
    
    print("\n" + "=" * 60)
    print("BUSINESS LOGIC TESTS")
    print("=" * 60)
    
    # Business logic tests
    tester.test_time_conflict_validation()
    
    # Final results
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("\n🎉 All tests passed! Backend API is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {tester.tests_run - tester.tests_passed} test(s) failed. Check the details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())