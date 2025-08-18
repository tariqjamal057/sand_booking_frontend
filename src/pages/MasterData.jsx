import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const API_BASE_URL = "https://bhaktabhim.duckdns.org/booking";

const bookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  booking_user: z.int().min(1, "User Credential is required"),
  district: z.int().min(1, "District is required"),
  stockyard: z.string().min(1, "Stockyard is required"),
  customerGstin: z.string().optional(),
  sandPurpose: z.string().min(1, "Purpose of Sand is required"),
  vehicleNo: z.string().min(1, "Vehicle No is required"),
  deliveryDistrict: z.int().min(1, "Delivery District is required"),
  deliveryMandal: z.int().min(1, "Delivery Mandal is required"),
  deliveryVillage: z.int().min(1, "Delivery Village is required"),
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
  const [bookingUsers, setBookingUsers] = useState([]);
  const [masterDataList, setMasterDataList] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
    const fetchInitialData = async () => {
      const fetchedDistricts = await fetchData(`${API_BASE_URL}/districts`);
      if (fetchedDistricts && fetchedDistricts.length > 0) {
        setDistricts(fetchedDistricts);
      }
      setBookingUsers(await fetchData(`${API_BASE_URL}/users`));
      setMasterDataList(await fetchData(`${API_BASE_URL}/master-data`));
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
      const bookingData = {
        name: data.name,
        booking_user: parseInt(data.booking_user),
        district: parseInt(data.district),
        stockyard: data.stockyard,
        gstin: data.customerGstin || null,
        sand_purpose: data.sandPurpose,
        vehicle_no: data.vehicleNo,
        delivery_district: parseInt(data.deliveryDistrict),
        delivery_mandal: parseInt(data.deliveryMandal),
        delivery_village: parseInt(data.deliveryVillage),
        delivery_slot: data.deliverySlot,
        payment_mode: data.paymentMode,
      };

      const url = editingId
        ? `${API_BASE_URL}/master-data/${editingId}`
        : `${API_BASE_URL}/master-data`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Save failed");

      fetchMasterData();
      reset();
      setEditingId(null);
      setIsModalOpen(false);
    } catch (error) {
      setAlertMessage(`Submission failed: ${error.message}`);
      setIsAlertModalOpen(true);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    reset({
      name: item.name,
      booking_user: item.booking_user.id,
      district: item.district.did,
      stockyard: item.stockyard.name,
      customerGstin: item.gstin,
      sandPurpose: item.sand_purpose,
      vehicleNo: item.vehicle_no,
      deliveryDistrict: item.delivery_district.did,
      deliveryMandal: item.delivery_mandal.mid,
      deliveryVillage: item.delivery_village.vid,
      deliverySlot: item.delivery_slot,
      paymentMode: item.payment_mode,
    });
    setIsModalOpen(true);
  };

  const handleView = async (id) => {
    const data = await fetchData(`${API_BASE_URL}/master-data/${id}`);
    setViewData(data);
    setIsViewModalOpen(true);
  };

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
              {isAlertModalOpen ? "Attention" : "Add New Booking" }
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

  const renderDetailField = ({ label, value }) => {
    return (
      <>
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <input
          className="mt-1 block w-full rounded-md border border-green-200 bg-white px-3 py-2 focus:border-green-500 focus:ring-green-500 outline-none sm:text-sm transition duration-300"
          disabled={true}
          value={value}
        />
      </>
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
        <div className="flex gap-2 items-center justify-between">
          <h1 className="text-lg font-semibold text-green-800 mb-2">
            Sand Booking Master Data
          </h1>
          <div className="flex mb-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition duration-200 text-sm cursor-pointer"
            >
              Add New Booking
            </button>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Information Section */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-4">
                  User Information
                </h3>
                <div className="space-y-4">
                  <InputField label="Name" name="name" />
                  <InputField
                    label="User Credential"
                    name="booking_user"
                    type="select"
                    options={bookingUsers.map((u) => ({
                      label: u.username,
                      value: u.id,
                    }))}
                  />
                  <InputField label="GSTIN" name="customerGstin" />
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
                  <InputField label="Vehicle No" name="vehicleNo" />
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
                className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 ${
                  loading ? "cursor-not-allowed" : "cursor-pointer"
                }`}
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

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Stockyard
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Vehicle No
                  </th> */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Delivery District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Delivery Mandal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Delivery Village
                  </th> */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Payment Mode
                  </th> */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Purpose
                  </th> */}
                  {/* <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Slot
                  </th> */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              {masterDataList.length > 0 ? (
                <tbody className="bg-white divide-y divide-gray-200">
                  {masterDataList.map((data, index) => (
                    <tr key={data.id} className="hover:bg-green-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.booking_user?.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.district?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.stockyard?.name}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.vehicleNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {districts.find(
                          (d) => String(d.did) === data.deliveryDistrict
                        )?.name || data.deliveryDistrict}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {mandals.find(
                          (m) => String(m.mid) === data.deliveryMandal
                        )?.name || data.deliveryMandal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {villages.find(
                          (v) => String(v.vid) === data.deliveryVillage
                        )?.name || data.deliveryVillage}
                      </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.payment_mode}
                      </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.sandPurpose === "1"
                          ? "Domestic"
                          : data.sandPurpose === "2"
                          ? "Commercial"
                          : data.sandPurpose === "3"
                          ? "Govt.Civil Works"
                          : data.sandPurpose}
                      </td> */}
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {data.delivery_slot}
                      </td> */}
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleEdit(data)}
                          className="text-blue-600 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleView(data.id)}
                          className="text-green-600 cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td
                      className="text-center px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      colSpan={12}
                    >
                      No Data Found
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>
        </div>
      </div>
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        {viewData ? (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{viewData.name} Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-4">
                  User Information
                </h3>
                <div className="space-y-4">
                  {renderDetailField({
                    label: "Name",
                    value: viewData.name,
                  })}
                  {renderDetailField({
                    label: "User Credential",
                    value: viewData.booking_user?.username,
                  })}
                  {renderDetailField({
                    label: "GSTIN",
                    value: viewData.gstin,
                  })}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-4">
                  Booking Details
                </h3>
                <div className="space-y-4">
                  {renderDetailField({
                    label: "District",
                    value: viewData.district?.name,
                  })}
                  {renderDetailField({
                    label: "Stockyard",
                    value: viewData.stockyard?.name,
                  })}
                  {renderDetailField({
                    label: "Purpose of sand",
                    value:
                      viewData.sand_purpose === "1"
                        ? "Domestic"
                        : viewData.sand_purpose === "2"
                        ? "Commercial"
                        : viewData.sand_purpose === "3"
                        ? "Govt.Civil Works"
                        : viewData.sand_purpose,
                  })}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-4">
                  Delivery Location Details
                </h3>
                <div className="space-y-4">
                  {renderDetailField({
                    label: "Delivery District",
                    value: viewData.delivery_district?.name,
                  })}
                  {renderDetailField({
                    label: "Delivery Mandal",
                    value: viewData.delivery_mandal?.name,
                  })}
                  {renderDetailField({
                    label: "Delivery Village",
                    value: viewData.delivery_village?.name,
                  })}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-4">
                  Delivery & Payments
                </h3>
                <div className="space-y-4">
                  {renderDetailField({
                    label: "Vehicle No",
                    value: viewData.vehicle_no,
                  })}
                  {renderDetailField({
                    label: "Delivery Slot",
                    value: viewData.delivery_slot,
                  })}
                  {renderDetailField({
                    label: "Payment Mode",
                    value: viewData.payment_mode,
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </div>
  );
};

export default MasterData;
