import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useCreateSaleInvoiceMutation } from "@/features/invoice/saleInvoiceApiSlice";
import { useGetUsersQuery } from "@/features/user/userApiSlice";
import { useGetProductsQuery } from "@/features/product/productApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import {
  CreateInvoiceHeader,
  InvoiceDetailsSection,
  InvoiceSidebar,
  BillFromToSection,
  InvoiceItemsSection,
  ExtraInfoSection,
  InvoiceSummarySection,
  CreateInvoiceFooter,
  InvoicePreviewModal,
} from "./components";

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { t } = useTranslation();

  const [items, setItems] = useState([
    {
      id: 1,
      name: "",
      productId: null,
      type: "product",
      quantity: 1,
      unit: "Pcs",
      rate: 0,
      discount: 0,
      discountType: "%",
      tax: 0,
      amount: 0,
    },
  ]);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    referenceNumber: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    recurring: false,
    recurringInterval: "Monthly",
    recurringDuration: "1 Month",
    enableTax: true,
    billFrom: "",
    customerId: "",
    notes: "",
    termsAndConditions: "",
    signatureName: "",
    signatureImage: "",
    logoImage: "",
    logoWidth: 120,
    logoHeight: 120,
    roundOff: true,
    discountTotal: 0,
    discountType: "%",
    status: "draft",
    currency: "BDT",
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
      paymentReference: "",
    },
  });

  const [extraInfoTab, setExtraInfoTab] = useState("notes");
  const [showPreview, setShowPreview] = useState(false);
  const signatureInputRef = useRef(null);

  const [createSaleInvoice, { isLoading }] = useCreateSaleInvoiceMutation();
  const { data: customers = [] } = useGetUsersQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );
  const { data: products = [] } = useGetProductsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );
  const { uploadImage: uploadSignature, isUploading: isUploadingSignature } = useImageUpload();
  const { uploadImage: uploadLogo, isUploading: isUploadingLogo } = useImageUpload();

  const subTotal = items.reduce((acc, item) => acc + item.amount, 0);
  const cgst = subTotal * 0.09;
  const sgst = subTotal * 0.09;
  const discountTotalCalc = subTotal * (invoiceData.discountTotal / 100);
  const total = subTotal + cgst + sgst - discountTotalCalc;

  const selectedCustomer = customers.find(c => c.id === Number(invoiceData.customerId));
  
  const companyInfo = {
    companyName: authUser?.companyName,
    branchLocation: authUser?.branchLocation,
    phone: authUser?.phone,
    email: authUser?.email,
  };

  const calcItemAmount = (qty, rate, discount = 0, tax = 0) => {
    const base = qty * rate;
    const afterDiscount = base * (1 - (discount || 0) / 100);
    return Math.round(afterDiscount * (1 + (tax || 0) / 100) * 100) / 100;
  };

  const handleSave = async () => {
    if (!invoiceData.customerId) {
      toast.error(t("invoices.create.validation.customerRequired"));
      return;
    }
    const validItems = items.filter((i) => i.name && i.quantity > 0 && i.rate > 0);
    if (validItems.length === 0) {
      toast.error(t("invoices.create.validation.itemsRequired"));
      return;
    }
    try {
      const payload = {
        companyId: authUser?.companyId,
        invoiceNumber: invoiceData.invoiceNumber,
        referenceNumber: invoiceData.referenceNumber || undefined,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate || undefined,
        customerId: Number(invoiceData.customerId),
        status: invoiceData.status,
        currency: invoiceData.currency,
        isRecurring: invoiceData.recurring,
        recurringInterval: invoiceData.recurringInterval,
        notes: invoiceData.notes || undefined,
        termsAndConditions: invoiceData.termsAndConditions || undefined,
        bankDetails:
          invoiceData.bankDetails?.bankName ||
          invoiceData.bankDetails?.accountNumber
            ? {
                ...invoiceData.bankDetails,
                paymentReference:
                  invoiceData.bankDetails?.paymentReference ||
                  invoiceData.invoiceNumber,
              }
            : undefined,
        subTotal,
        taxTotal: cgst + sgst,
        discountTotal: discountTotalCalc,
        totalAmount: total,
        signatureName: invoiceData.signatureName || undefined,
        signatureImage: invoiceData.signatureImage || undefined,
        items: validItems.map((i) => ({
          name: i.name,
          productId: i.productId || undefined,
          itemType: i.type === "service" ? "service" : "product",
          quantity: Number(i.quantity),
          unit: i.unit || "Pcs",
          rate: Number(i.rate),
          discount: Number(i.discount) || 0,
          tax: Number(i.tax) || 0,
          amount: Number(i.amount),
        })),
      };

      const result = await createSaleInvoice(payload).unwrap();
      toast.success(t("invoices.create.toast.createdSuccess"));
      navigate(`/invoices/${result.id}`);
    } catch (err) {
      toast.error(
        err?.data?.message || t("invoices.create.toast.createdFailed"),
      );
    }
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: "",
        productId: null,
        type: "product",
        quantity: 1,
        unit: "Pcs",
        rate: 0,
        discount: 0,
        discountType: "%",
        tax: 0,
        amount: 0,
      },
    ]);
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadSignature(file);
    if (url) {
      setInvoiceData((prev) => ({ ...prev, signatureImage: url }));
    }
    e.target.value = "";
  };

  const handleLogoUpload = async (file) => {
    const url = await uploadLogo(file);
    if (url) {
      setInvoiceData((prev) => ({ ...prev, logoImage: url }));
    }
  };

  const removeSignature = () => {
    setInvoiceData((prev) => ({ ...prev, signatureImage: "" }));
  };

  const handleProductSelect = (itemId, productId) => {
    const product = products.find((p) => p.id === Number(productId));
    if (!product) return;
    const rate = Number(product.price) || Number(product.discountPrice) || 0;
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              productId: product.id,
              name: product.name,
              rate,
              quantity: 1,
              discount: i.discount || 0,
              tax: i.tax || 0,
              amount: calcItemAmount(1, rate, i.discount, i.tax),
            }
          : i
      )
    );
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f14] p-4 lg:p-8">
      <CreateInvoiceHeader
        onBack={() => navigate(-1)}
        onPreview={() => setShowPreview(true)}
      />

      <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 lg:p-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <InvoiceDetailsSection
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
            />
            <InvoiceSidebar
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
              onLogoUpload={handleLogoUpload}
              isUploadingLogo={isUploadingLogo}
            />
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          <BillFromToSection
            authUser={authUser}
            invoiceData={invoiceData}
            setInvoiceData={setInvoiceData}
            customers={customers}
            onAddNewCustomer={() => navigate("/customers/create")}
          />

          <hr className="border-gray-100 dark:border-gray-800" />

          <InvoiceItemsSection
            items={items}
            setItems={setItems}
            products={products}
            addItem={addItem}
            removeItem={removeItem}
            handleProductSelect={handleProductSelect}
            calcItemAmount={calcItemAmount}
          />

          <hr className="border-gray-100 dark:border-gray-800" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-8">
              <ExtraInfoSection
                extraInfoTab={extraInfoTab}
                setExtraInfoTab={setExtraInfoTab}
                invoiceData={invoiceData}
                setInvoiceData={setInvoiceData}
              />
            </div>
            <InvoiceSummarySection
              subTotal={subTotal}
              cgst={cgst}
              sgst={sgst}
              total={total}
              invoiceData={invoiceData}
              setInvoiceData={setInvoiceData}
              signatureInputRef={signatureInputRef}
              handleSignatureUpload={handleSignatureUpload}
              removeSignature={removeSignature}
              isUploadingSignature={isUploadingSignature}
            />
          </div>

          <CreateInvoiceFooter
            onCancel={() => navigate(-1)}
            onSave={handleSave}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <InvoicePreviewModal
        open={showPreview}
        onOpenChange={setShowPreview}
        invoiceData={invoiceData}
        items={items}
        customer={selectedCustomer}
        companyInfo={companyInfo}
        subTotal={subTotal}
        taxTotal={cgst + sgst}
        discountTotal={discountTotalCalc}
        total={total}
      />
    </div>
  );
};

export default CreateInvoicePage;
