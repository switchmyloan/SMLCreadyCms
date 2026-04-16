import React, { useEffect, useState, useRef } from "react";
import { Toaster } from "react-hot-toast";
import ToastNotification from "@components/Notification/ToastNotification";
import Drawer from "../../../components/Drawer";
import ValidatedTextField from "../../../components/Form/ValidatedTextField";
import ValidatedTextArea from "../../../components/Form/ValidatedTextArea";
import ValidatedLabel from "../../../components/Form/ValidatedLabel";
import Uploader from "../../../components/Form/Uploader";
import SubmitBtn from "@components/Form/SubmitBtn";
import ConfirmModal from "../../../components/ConfirmationationModal";
import { useForm } from "react-hook-form";
import { CiSearch, CiMenuKebab, CiEdit, CiTrash } from "react-icons/ci";
import {
  getCreditCards,
  AddCreditCard,
  getCreditCardById,
  UpdateCreditCard,
  deleteCreditCard,
} from "../../../api-services/Modules/CreditCardApi";

const imageUrl = import.meta.env.VITE_IMAGE_URL;

const CARD_TYPE_OPTIONS = [
  { value: "ZetCard", label: "ZET Card (Vertical)" },
  { value: "NovioCard", label: "Novio Card (Vertical)" },
  { value: "IobCard", label: "IOB Card (Vertical)" },
  { value: "LegacyPurpleCard", label: "Legacy Purple Card (Horizontal)" },
  { value: "BizFirstCard", label: "BizFirst Card (Horizontal)" },
  { value: "IndianOilVisaCard", label: "IndianOil Visa Card (Horizontal)" },
  { value: "SwiggyHdfcCard", label: "Swiggy HDFC Card (Horizontal)" },
];

const THEME_OPTIONS = [
  { value: "diners", label: "Diners (Dark)" },
  { value: "gold", label: "Gold" },
  { value: "teal", label: "Teal" },
  { value: "coral", label: "Coral" },
];

const SPARK_OPTIONS = [
  { value: "purple", label: "Purple" },
  { value: "gold", label: "Gold" },
  { value: "teal", label: "Teal" },
  { value: "coral", label: "Coral" },
];

const NETWORK_OPTIONS = [
  { value: "RuPay", label: "RuPay" },
  { value: "Visa", label: "Visa" },
  { value: "MasterCard", label: "MasterCard" },
];

const CreditCards = () => {
  const [data, setData] = useState([]);
  const [totalDataCount, setTotalDataCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);
  const [query, setQuery] = useState({
    limit: 10,
    page_no: 1,
    search: "",
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      bank: "",
      cardLabel: "",
      cardNumber: "",
      network: "RuPay",
      theme: "diners",
      badge: "",
      tags: "",
      features: "",
      joiningFee: "",
      feeNote: "",
      ctaLabel: "Check Eligibility →",
      sparkType: "purple",
      cardType: "ZetCard",
      intrinsicWidth: 275,
      intrinsicHeight: 430,
      ctaLink: "",
      displayOrder: 0,
      cardImage: "",
      isActive: true,
    },
  });

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await getCreditCards(query.page_no, query.limit, query.search);
      if (response?.data?.success) {
        const rows = response.data.data.rows;
        if (Array.isArray(rows)) {
          setData(rows);
          setTotalDataCount(response.data.data.pagination?.total || 0);
        } else {
          setData([]);
        }
      } else {
        ToastNotification.error("Error fetching credit cards");
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching:", error);
      ToastNotification.error("Failed to fetch credit cards");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [query.page_no, query.search]);

  const handleSearch = (e) => {
    setQuery((prev) => ({ ...prev, search: e.target.value, page_no: 1 }));
  };

  const onPageChange = (pageNo) => {
    setQuery((prev) => ({ ...prev, page_no: pageNo }));
  };

  const handleCreate = () => {
    setIsDrawerOpen(true);
    setIsEditMode(false);
    reset();
  };

  const handleEdit = async (id) => {
    try {
      console.log("Edit clicked, id:", id);
      const response = await getCreditCardById(id);
      console.log("Edit response:", response?.data);
      if (response?.data?.success) {
        const card = response.data.data;

        setIsEditMode(true);
        setSelectedCard(id);
        setIsDrawerOpen(true);
        setOpenDropdownId(null);

        setValue("name", card.name || "");
        setValue("bank", card.bank || "");
        setValue("cardLabel", card.cardLabel || "");
        setValue("cardNumber", card.cardNumber || "");
        setValue("network", card.network || "RuPay");
        setValue("theme", card.theme || "diners");
        setValue("badge", card.badge || "");
        setValue(
          "tags",
          Array.isArray(card.tags) ? card.tags.join(", ") : card.tags || ""
        );
        setValue(
          "features",
          Array.isArray(card.features)
            ? card.features.join("\n")
            : card.features || ""
        );
        setValue("joiningFee", card.joiningFee || "");
        setValue("feeNote", card.feeNote || "");
        setValue("ctaLabel", card.ctaLabel || "");
        setValue("sparkType", card.sparkType || "purple");
        setValue("cardType", card.cardType || "ZetCard");
        setValue("intrinsicWidth", card.intrinsicWidth || 275);
        setValue("intrinsicHeight", card.intrinsicHeight || 430);
        setValue("ctaLink", card.ctaLink || "");
        setValue("displayOrder", card.displayOrder || 0);
        setValue(
          "isActive",
          card.isActive !== undefined ? card.isActive : true
        );

        if (card.cardImage) {
          setValue("cardImage", `${imageUrl}${card.cardImage}`);
        } else {
          setValue("cardImage", "");
        }
      } else {
        ToastNotification.error("Failed to fetch card details");
      }
    } catch (error) {
      console.error("Error fetching card:", error);
      ToastNotification.error("Failed to fetch card details");
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("bank", formData.bank);
      formDataToSend.append("cardLabel", formData.cardLabel);
      formDataToSend.append("cardNumber", formData.cardNumber);
      formDataToSend.append("network", formData.network);
      formDataToSend.append("theme", formData.theme);
      formDataToSend.append("badge", formData.badge || "");
      formDataToSend.append("joiningFee", formData.joiningFee);
      formDataToSend.append("feeNote", formData.feeNote || "");
      formDataToSend.append("ctaLabel", formData.ctaLabel);
      formDataToSend.append("ctaLink", formData.ctaLink || "");
      formDataToSend.append("sparkType", formData.sparkType);
      formDataToSend.append("cardType", formData.cardType);
      formDataToSend.append("intrinsicWidth", String(formData.intrinsicWidth));
      formDataToSend.append("intrinsicHeight", String(formData.intrinsicHeight));
      formDataToSend.append("displayOrder", String(formData.displayOrder));
      formDataToSend.append(
        "isActive",
        String(
          formData.isActive === true ||
            String(formData.isActive).toLowerCase() === "true"
        )
      );

      const tags = formData.tags
        ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];
      formDataToSend.append("tags", JSON.stringify(tags));

      const features = formData.features
        ? formData.features.split("\n").map((f) => f.trim()).filter(Boolean)
        : [];
      formDataToSend.append("features", JSON.stringify(features));

      if (formData.cardImage && formData.cardImage instanceof File) {
        formDataToSend.append("cardImage", formData.cardImage);
      }

      if (isEditMode) {
        const response = await UpdateCreditCard(selectedCard, formDataToSend);
        if (response?.data?.success) {
          ToastNotification.success("Credit card updated successfully!");
          fetchCards();
          closeDrawer();
        } else {
          ToastNotification.error("Failed to update credit card!");
        }
      } else {
        const response = await AddCreditCard(formDataToSend);
        if (response?.data?.success) {
          ToastNotification.success("Credit card created successfully!");
          fetchCards();
          closeDrawer();
        } else {
          ToastNotification.error("Failed to create credit card!");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      ToastNotification.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsEditMode(false);
    setSelectedCard(null);
    reset();
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteCreditCard(cardToDelete);
      if (response?.data?.success) {
        ToastNotification.success("Credit card deleted successfully!");
        fetchCards();
      } else {
        ToastNotification.error("Failed to delete credit card!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      ToastNotification.error("Something went wrong!");
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setCardToDelete(null);
    }
  };

  const totalPages = Math.ceil(totalDataCount / query.limit);
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, query.page_no - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 lg:pt-0 font-sans bg-gray-50 min-h-screen">
      <Toaster />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Credit Cards</h1>
          <p className="text-gray-600 mt-1">Manage all credit cards from one place.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1">
            <CiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Search cards..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={query.search}
              onChange={handleSearch}
            />
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            onClick={handleCreate}
          >
            Add Card
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 animate-pulse">Loading cards...</p>
        </div>
      ) : data && Array.isArray(data) && data.length > 0 ? (
        <>
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Card Name</th>
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-4 py-3">Network</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((card) => (
                  <tr key={card.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">{card.displayOrder ?? "-"}</td>
                    <td className="px-4 py-3">
                      {card.cardImage ? (
                        <img
                          src={`${imageUrl}${card.cardImage}`}
                          alt={card.name}
                          className="w-16 h-10 object-cover rounded-md border"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{card.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{card.bank}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{card.network}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(card.tags) &&
                          card.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          card.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {card.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="relative"
                        ref={openDropdownId === card.id ? dropdownRef : null}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(
                              openDropdownId === card.id ? null : card.id
                            );
                          }}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <CiMenuKebab size={20} />
                        </button>
                        {openDropdownId === card.id && (
                          <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                            <li
                              onClick={() => handleEdit(card.id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            >
                              <CiEdit /> Edit
                            </li>
                            <li
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardToDelete(card.id);
                                setConfirmOpen(true);
                                setOpenDropdownId(null);
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                            >
                              <CiTrash /> Delete
                            </li>
                          </ul>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => onPageChange(query.page_no - 1)}
                  disabled={query.page_no === 1}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      query.page_no === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => onPageChange(query.page_no + 1)}
                  disabled={query.page_no === totalPages}
                  className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">No credit cards found.</p>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Credit Card"
        message="Are you sure you want to delete this credit card? This action cannot be undone."
        loading={loading}
      />

      {/* Create/Edit Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={isEditMode ? "Update Credit Card" : "Add Credit Card"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ValidatedTextField
            name="name"
            control={control}
            rules={{ required: true }}
            label="Card Name"
            placeholder="e.g. ZET RuPay Select Credit Card"
            errors={errors}
            helperText="Card name is required!"
          />

          <ValidatedTextField
            name="bank"
            control={control}
            rules={{ required: true }}
            label="Bank"
            placeholder="e.g. SBM Bank"
            errors={errors}
            helperText="Bank is required!"
          />

          <ValidatedTextField
            name="cardLabel"
            control={control}
            rules={{ required: true }}
            label="Card Label"
            placeholder="e.g. ZET Select"
            errors={errors}
            helperText="Card label is required!"
          />

          <ValidatedTextField
            name="cardNumber"
            control={control}
            rules={{ required: true }}
            label="Display Card Number"
            placeholder="e.g. 5241  4234  5678  1234"
            errors={errors}
            helperText="Card number is required!"
          />

          <div>
            <label className="block mb-1 text-sm font-medium">Network</label>
            <select
              {...register("network")}
              className="select select-bordered w-full"
            >
              {NETWORK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Theme</label>
            <select
              {...register("theme")}
              className="select select-bordered w-full"
            >
              {THEME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <ValidatedTextField
            name="badge"
            control={control}
            label="Badge (optional)"
            placeholder="e.g. Best FD-Backed Card"
            errors={errors}
          />

          <ValidatedTextField
            name="tags"
            control={control}
            rules={{ required: true }}
            label="Tags (comma separated)"
            placeholder="e.g. FD-Backed, Lifetime Free, Premium"
            errors={errors}
            helperText="Tags are required!"
          />

          <ValidatedTextArea
            name="features"
            control={control}
            label="Features (one per line)"
            errors={errors}
            placeholder={
              "e.g.\nBuild credit with your Fixed Deposit\nUp to 90% credit limit on FD value\nRuPay Select benefits & lounge access"
            }
            rows={4}
            rules={{ required: "Features are required" }}
          />

          <ValidatedTextField
            name="joiningFee"
            control={control}
            rules={{ required: true }}
            label="Joining Fee"
            placeholder="e.g. ₹0 Joining Fee"
            errors={errors}
            helperText="Joining fee is required!"
          />

          <ValidatedTextField
            name="feeNote"
            control={control}
            label="Fee Note"
            placeholder="e.g. *Lifetime free with FD"
            errors={errors}
          />

          <ValidatedTextField
            name="ctaLabel"
            control={control}
            rules={{ required: true }}
            label="CTA Button Label"
            placeholder="e.g. Check Eligibility →"
            errors={errors}
            helperText="CTA label is required!"
          />

          <ValidatedTextField
            name="ctaLink"
            control={control}
            label="CTA Link"
            placeholder="e.g. https://..."
            errors={errors}
          />

          <div>
            <label className="block mb-1 text-sm font-medium">
              Card Type (Visual)
            </label>
            <select
              {...register("cardType")}
              className="select select-bordered w-full"
            >
              {CARD_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Spark Type</label>
            <select
              {...register("sparkType")}
              className="select select-bordered w-full"
            >
              {SPARK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ValidatedTextField
              name="intrinsicWidth"
              control={control}
              label="Card Width"
              placeholder="275"
              errors={errors}
            />
            <ValidatedTextField
              name="intrinsicHeight"
              control={control}
              label="Card Height"
              placeholder="430"
              errors={errors}
            />
          </div>

          <ValidatedTextField
            name="displayOrder"
            control={control}
            label="Display Order"
            placeholder="0"
            errors={errors}
          />

          <ValidatedLabel label="Card Image" />
          <Uploader
            name="cardImage"
            control={control}
            label="Card Image"
            errors={errors}
          />

          <div>
            <label className="block mb-1 text-sm font-medium">Status</label>
            <select
              {...register("isActive")}
              className="select select-bordered w-full"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={closeDrawer}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <div>
              <SubmitBtn
                loading={loading}
                label={isEditMode ? "Update" : "Submit"}
              />
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
};

export default CreditCards;
