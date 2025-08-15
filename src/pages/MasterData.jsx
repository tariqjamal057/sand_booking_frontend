import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const API_BASE_URL = "https://31.97.232.231/booking";

const bookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  district: z.string().min(1, "District is required"),
  stockyard: z.string().min(1, "Stockyard is required"),
  customerGstin: z.string().optional(),
  sandPurpose: z.string().min(1, "Purpose of Sand is required"),
  vehicleNo: z.string().min(1, "Vehicle No is required"),
  deliveryDistrict: z.string().min(1, "Delivery District is required"),
  deliveryMandal: z.string().min(1, "Delivery Mandal is required"),
  deliveryVillage: z.string().min(1, "Delivery Village is required"),
  deliverySlot: z.string().min(1, "Delivery Slot is required"),
  paymentMode: z.string().min(1, "Payment Mode is required"),
});

const MasterData = () => {
  const [districts, setDistricts] = useState([]);
  const [stockyards, setStockyards] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [selectedDistrictStockyard, setSelectedDistrictStockyard] =
    useState(null);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  const selectedDistrictDid = watch("district");
  const selectedDeliveryDistrictDid = watch("deliveryDistrict");
  const selectedDeliveryMandalMid = watch("deliveryMandal");

  const fetchData = async (url) => {
    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setAlertMessage(`Failed to load data: ${err.message}`);
      setIsAlertModalOpen(true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateDeliverySlots = () => {
    const slots = [];
    const today = new Date();
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };

    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const formattedDate = date
        .toLocaleDateString("en-GB", options)
        .replace(/\//g, "-");
      slots.push({
        label: `${formattedDate} (06AM - 12NOON)`,
        value: `${formattedDate} (06AM - 12NOON)`,
      });
      slots.push({
        label: `${formattedDate} (12NOON - 06PM)`,
        value: `${formattedDate} (12NOON - 06PM)`,
      });
    }
    setDeliverySlots(slots);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const fetchedDistricts = await fetchData(`${API_BASE_URL}/districts`);
      if (fetchedDistricts && fetchedDistricts.length > 0) {
        setDistricts(fetchedDistricts);
      }
    };
    fetchInitialData();
    generateDeliverySlots();
  }, []);

  useEffect(() => {
    if (selectedDistrictDid) {
      const fetchStockyards = async () => {
        const fetchedStockyards = await fetchData(
          `${API_BASE_URL}/districts/${selectedDistrictDid}/stockyards`
        );
        if (fetchedStockyards) {
          setStockyards(fetchedStockyards);
        } else {
          setStockyards([]);
        }
      };
      fetchStockyards();
    } else {
      setStockyards([]);
    }
  }, [selectedDistrictDid]);

  useEffect(() => {
    if (selectedDeliveryDistrictDid) {
      const fetchMandals = async () => {
        const fetchedMandals = await fetchData(
          `${API_BASE_URL}/districts/${selectedDeliveryDistrictDid}/mandals`
        );
        if (fetchedMandals) {
          setMandals(fetchedMandals);
        } else {
          setMandals([]);
        }
      };
      fetchMandals();
    } else {
      setMandals([]);
    }
  }, [selectedDeliveryDistrictDid]);

  useEffect(() => {
    if (selectedDeliveryMandalMid) {
      const fetchVillages = async () => {
        const fetchedVillages = await fetchData(
          `${API_BASE_URL}/districts/mandals/${selectedDeliveryMandalMid}/villages`
        );
        if (fetchedVillages) {
          setVillages(fetchedVillages);
        } else {
          setVillages([]);
        }
      };
      fetchVillages();
    } else {
      setVillages([]);
    }
  }, [selectedDeliveryMandalMid]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Here, you would make the actual POST request to the booking endpoint
      // const response = await fetch(`${API_BASE_URL}/book-now`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // if (!response.ok) {
      //   throw new Error('Submission failed');
      // }
      // const result = await response.json();

      // Simulate successful submission for demonstration
      setSubmittedData([...submittedData, { ...data, id: Date.now() }]);
      setAlertMessage("Booking submitted successfully!");
      setIsAlertModalOpen(true);
      reset(); // Reset form fields
    } catch (error) {
      setAlertMessage(`Submission failed: ${error.message}`);
      setIsAlertModalOpen(true);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  // Watch for stockyard selection and log details
  const selectedStockyard = watch("stockyard");
  useEffect(() => {
    if (selectedStockyard) {
      const stockyardDetails = stockyards.find(
        (s) => s.name === selectedStockyard
      );
      if (stockyardDetails) {
        console.log("Selected Stockyard Details:", stockyardDetails);
        setSelectedDistrictStockyard(stockyardDetails);
      }
    }
  }, [selectedStockyard, stockyards]);

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return createPortal(
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <div className="sticky top-0 bg-white px-6  border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-green-700">
              {isAlertModalOpen ? "Attention" : "Add New Booking"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold cursor-pointer p-2"
            >
              &times;
            </button>
          </div>
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>,
      document.body
    );
  };

  const InputField = ({
    label,
    name,
    type = "text",
    options = [],
    disabled = false,
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {type === "select" ? (
        <select
          id={name}
          {...register(name)}
          className="mt-1 block w-full rounded-md outline-none focus:border-green-500 focus:ring-green-500 sm:text-sm bg-white px-3 py-2 border border-green-200 transition duration-300"
          disabled={disabled || loading}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          {...register(name)}
          className="mt-1 block w-full rounded-md border border-green-200 bg-white px-3 py-2 focus:border-green-500 focus:ring-green-500 outline-none sm:text-sm transition duration-300"
          disabled={disabled || loading}
          autoComplete="additional-name"
        />
      )}
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600">{errors[name].message}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-[70vh] bg-green-50">
      <div className="mx-auto">
        <h1 className="text-lg font-semibold text-green-800 mb-2">
          Sand Booking Master Data
        </h1>
        <div className="flex mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200 text-sm"
          >
            Add New Booking
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="ml-4 text-green-700">Loading data...</p>
          </div>
        )}

        {/* Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            reset();
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Information Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-4">
                  User Information
                </h3>
                <div className="space-y-4">
                  <InputField label="Name" name="name" />
                  <InputField label="Username" name="username" />
                  <InputField
                    label="Password"
                    name="password"
                    type="password"
                  />
                </div>
              </div>

              {/* Booking Details Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-4">
                  Booking Details
                </h3>
                <div className="space-y-4">
                  <InputField
                    label="District"
                    name="district"
                    type="select"
                    options={districts.map((d) => ({
                      label: d.name,
                      value: String(d.did),
                    }))}
                  />
                  <InputField
                    label="Stockyard"
                    name="stockyard"
                    type="select"
                    options={stockyards.map((s) => ({
                      label: s.name,
                      value: s.name,
                    }))}
                    disabled={!selectedDistrictDid}
                  />
                  {selectedDistrictStockyard && (
                    <div className="text-sm font-semibold text-gray-500">
                      <p>
                        Sand Quality: {selectedDistrictStockyard.sand_quality}
                      </p>
                      <p>
                        Sand Price: {selectedDistrictStockyard.sand_price}rs
                      </p>
                    </div>
                  )}
                  <InputField
                    label="Purpose of Sand"
                    name="sandPurpose"
                    type="select"
                    options={[
                      { value: "", label: "--Select--" },
                      { value: "1", label: "Domestic" },
                      { value: "2", label: "Commercial" },
                      { value: "3", label: "Govt.Civil Works" },
                    ]}
                  />
                  <InputField label="GSTIN" name="customerGstin" />
                  <InputField label="Vehicle No" name="vehicleNo" />
                </div>
              </div>

              {/* Delivery Details Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-4">
                  Delivery Location Details
                </h3>
                <div className="space-y-4">
                  <InputField
                    label="Delivery District"
                    name="deliveryDistrict"
                    type="select"
                    options={districts.map((d) => ({
                      label: d.name,
                      value: String(d.did),
                    }))}
                  />
                  <InputField
                    label="Delivery Mandal"
                    name="deliveryMandal"
                    type="select"
                    options={mandals.map((m) => ({
                      label: m.name,
                      value: String(m.mid),
                    }))}
                    disabled={!selectedDeliveryDistrictDid}
                  />
                  <InputField
                    label="Delivery Village"
                    name="deliveryVillage"
                    type="select"
                    options={villages.map((v) => ({
                      label: v.name,
                      value: String(v.vid),
                    }))}
                    disabled={!selectedDeliveryMandalMid}
                  />
                </div>
              </div>

              {/* Delivery and payment details Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-4">
                  Delivery & Payments
                </h3>
                <div className="space-y-4">
                  <InputField
                    label="Delivery Slot"
                    name="deliverySlot"
                    type="select"
                    options={deliverySlots.map((s) => ({
                      label: s.label,
                      value: s.value,
                    }))}
                  />
                  <InputField
                    label="Payment Mode"
                    name="paymentMode"
                    type="select"
                    options={[
                      { value: "PAYU", label: "PAYU" },
                      { value: "UPI", label: "UPI" },
                      { value: "QR", label: "QR" },
                      { value: "CF", label: "Cash Free (Other Banks)" },
                      { value: "CFM", label: "Cash Free (Major Banks)" },
                    ]}
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Booking"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Alert Modal */}
        <Modal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
        >
          <p className="text-gray-700 text-center">{alertMessage}</p>
        </Modal>

        {/* Submitted Data */}
        {submittedData.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-green-700 mb-6">
              Submitted Bookings ({submittedData.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {submittedData.map((data, index) => (
                <div
                  key={data.id}
                  className="bg-green-50 rounded-lg p-4 shadow-md"
                >
                  <h4 className="text-lg font-semibold text-green-700 mb-2">
                    Booking #{index + 1}: {data.name}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <strong>Username:</strong> {data.username}
                    </p>
                    <p>
                      <strong>District:</strong> {data.district}
                    </p>
                    <p>
                      <strong>Stockyard:</strong> {data.stockyard}
                    </p>
                    <p>
                      <strong>Vehicle:</strong> {data.vehicleNo}
                    </p>
                    <p>
                      <strong>Delivery District:</strong>{" "}
                      {data.deliveryDistrict}
                    </p>
                    <p>
                      <strong>Delivery Mandal:</strong> {data.deliveryMandal}
                    </p>
                    <p>
                      <strong>Delivery Village:</strong> {data.deliveryVillage}
                    </p>
                    <p>
                      <strong>Payment:</strong> {data.paymentMode}
                    </p>
                    <p>
                      <strong>Purpose:</strong> {data.sandPurpose}
                    </p>
                    <p>
                      <strong>Slot:</strong> {data.deliverySlot}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterData;
