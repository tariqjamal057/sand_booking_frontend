import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const API_BASE_URL = "http://127.0.0.1:8000/booking";

export default function Home() {
  const [masterDataList, setMasterDataList] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch master data for dropdown
  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/master-data`);
      if (!response.ok) throw new Error("Failed to fetch master data");
      const data = await response.json();
      setMasterDataList(data || []);
    } catch (err) {
      console.error("Error fetching master data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Start booking process
  const startBooking = async (bookingMasterId) => {
    if (!bookingMasterId) return;

    setIsRunning(true);
    setBookingStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_master_id: bookingMasterId }),
      });

      const data = await response.json();

      // Add new booking to active bookings
      const newBooking = {
        id: data.id,
        username: data.booking_master?.booking_user?.username || "N/A",
        stockyard: data.booking_master?.stockyard?.name || "N/A",
        status: data.status,
        started_at: data.started_at,
        ended_at: data.ended_at,
        proxy: data.proxy,
        message: data.message,
      };

      setActiveBookings((prev) => [...prev, newBooking]);
      setBookingStatus(data);
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingStatus({ status: "failed", message: error.message });
    } finally {
      setIsRunning(false);
      setIsModalOpen(false);
    }
  };

  // Close booking and remove from active
  const closeBooking = (bookingId) => {
    setActiveBookings((prev) =>
      prev.filter((booking) => booking.id !== bookingId)
    );
  };

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-xl w-full relative">
          <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-green-700">
              Select Booking
            </h2>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer"
            >
              &times;
            </button>
          </div>
          <div className="px-6">
            <p className="text-xs text-gray-500 font-semibold my-1">
              Select booking master data from dropdown with label combination
            </p>
            <p className="text-xs text-gray-500 font-semibold">
              (Unique master data name) - (master data stockyard name) - (master
              data username)
            </p>
          </div>
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="min-h-[70vh] bg-green-50">
      <div className="mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-green-800">
            Sand Booking Automation
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200"
          >
            Create New
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="ml-4 text-green-700">Loading data...</p>
          </div>
        )}

        {/* Booking Selection Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Booking Configuration
            </label>
            <select
              value={selectedBookingId || ""}
              onChange={(e) => setSelectedBookingId(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-green-200 bg-white px-3 py-2 focus:border-green-500 focus:ring-green-500"
            >
              <option value="">-- Select Booking --</option>
              {masterDataList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.stockyard.name} -{" "}
                  {item.booking_user.username}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => startBooking(selectedBookingId)}
                disabled={!selectedBookingId || isRunning}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {isRunning ? "Starting..." : "Start Booking"}
              </button>
            </div>
          </div>
        </Modal>

        {/* Active Bookings Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-md p-4 border border-green-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-green-700">
                  Booking #{booking.id}
                </h3>
                <button
                  onClick={() => closeBooking(booking.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Close
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Username:
                  </span>
                  <span className="ml-2 text-sm">{booking.username}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Stockyard:
                  </span>
                  <span className="ml-2 text-sm">{booking.stockyard}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span
                    className={`ml-2 text-sm font-semibold ${
                      booking.status === "success"
                        ? "text-green-600"
                        : booking.status === "failed"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {booking.status?.toUpperCase()}
                  </span>
                </div>
                {booking.started_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Started:
                    </span>
                    <span className="ml-2 text-sm">
                      {new Date(booking.started_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.ended_at && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Ended:
                    </span>
                    <span className="ml-2 text-sm">
                      {new Date(booking.ended_at).toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.message && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Message:
                    </span>
                    <span className="ml-2 text-sm">{booking.message}</span>
                  </div>
                )}
                {booking.proxy && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Proxy:
                    </span>
                    <span className="ml-2 text-sm">{booking.proxy}</span>
                  </div>
                )}
              </div>

              {/* Tab-like display */}
              <div className="mt-4 pt-2 border-t border-gray-200">
                <div className="flex space-x-1">
                  <div className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    Tab #{booking.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No bookings message */}
        {activeBookings.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No active bookings. Click "Create New" to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
