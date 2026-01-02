"use client";

import { useState, useEffect, useRef } from "react";
import { Organization, CreateOrganizationPayload, uploadOrganizationProfile } from "@/services/organization";
import { getSubscriptionPlans, SubscriptionPlan } from "@/services/subscription";
import { useToastContext } from "./ToastProvider";
import Image from "next/image";

interface OrganizationFormProps {
  organization: Organization | null;
  isLoading: boolean;
  onSubmit: (data: CreateOrganizationPayload) => Promise<void>;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function OrganizationForm({
  organization,
  isLoading,
  onSubmit,
  onClose,
  onRefresh,
}: OrganizationFormProps) {
  const [formData, setFormData] = useState<CreateOrganizationPayload>({
    name: "",
    description: "",
    // expired_date removed - subscription drives expiry
    auto_create_admin: true, // Default true
    admin_name: "",
    admin_email: "",
    admin_password: "",
  });
  const [displayExpiry, setDisplayExpiry] = useState<string>("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedDurationMonths, setSelectedDurationMonths] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToastContext();

  useEffect(() => {
    console.log("🔄 OrganizationForm useEffect triggered, organization:", organization);
    // fetch available subscription plans for selection
    (async () => {
      try {
        const plansData = await getSubscriptionPlans();
        setPlans(plansData || []);
      } catch (err) {
        console.warn("Failed to load subscription plans", err);
      }
    })();
    
    if (organization) {
      console.log("🔄 Organization data updated:", {
        id: organization.id,
        name: organization.name,
        profile_image_url: organization.profile_image_url,
        profile_picture_url: organization.profile_picture_url,
        expiry_date: organization.expiry_date,
      });
      
      // For display only, parse existing expiry from organization if present
      let expiryDateValue = "";
      if (organization.expiry_date) {
        expiryDateValue = organization.expiry_date.split("T")[0];
        console.log("📅 Parsed expiry date for display:", expiryDateValue);
      }

      setFormData({
        name: organization.name,
        description: organization.description || "",
        auto_create_admin: false, // Editing mode, no auto-create
        admin_name: "",
        admin_email: "",
        admin_password: "",
      });
      setDisplayExpiry(expiryDateValue);
      // For editing, pre-select current plan and duration if available
      setSelectedPlanId(organization.current_plan_id || null);
      setSelectedDurationMonths(organization.current_duration_months || null);
      
      const imageUrl = organization.profile_image_url || organization.profile_picture_url || null;
      console.log("🖼️ Setting profile image to:", imageUrl);
      setProfileImage(imageUrl);
    } else {
      setFormData({
        name: "",
        description: "",
        auto_create_admin: true,
        admin_name: "",
        admin_email: "",
        admin_password: "",
      });
      setDisplayExpiry("");
      setProfileImage(null);
      setSelectedPlanId(null);
      setSelectedDurationMonths(null);
    }
    setError("");
    setSelectedFile(null);
  }, [organization]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helpers to compute expiry date from selected duration (months)
  const addMonthsToDate = (date: Date, months: number) => {
    const d = new Date(date);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    // handle month overflow
    if (d.getDate() !== day) {
      d.setDate(0);
    }
    return d;
  };

  const formatDateYYYYMMDD = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const computeExpiryFromSelection = (planId: string | null, months: number | null) => {
    if (!planId || !months) {
      setDisplayExpiry("");
      return;
    }
    const now = new Date();
    const newExpiry = addMonthsToDate(now, months);
    setDisplayExpiry(formatDateYYYYMMDD(newExpiry));
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    // reset duration selection when plan changes
    setSelectedDurationMonths(null);
    setDisplayExpiry("");
  };

  const handleDurationChange = (months: number) => {
    setSelectedDurationMonths(months);
    computeExpiryFromSelection(selectedPlanId, months);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("📁 File input changed");
    const file = e.target.files?.[0];
    console.log("📁 Selected file:", file?.name, file?.size, file?.type);
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        console.error("❌ Invalid file type:", file.type);
        setError("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error("❌ File too large:", file.size);
        setError("Image size must be less than 5MB");
        return;
      }
      
      console.log("✅ File validation passed, setting selectedFile");
      setSelectedFile(file);
      
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("🖼️ Image preview loaded");
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    } else {
      console.log("⚠️ No file selected");
    }
  };

  const handleUploadImage = async () => {
    console.log("🔘 Upload button clicked!");
    console.log("📋 State check:", {
      hasSelectedFile: !!selectedFile,
      selectedFileName: selectedFile?.name,
      hasOrganization: !!organization,
      organizationId: organization?.id,
    });
    
    if (!selectedFile || !organization?.id) {
      console.warn("⚠️ Cannot upload - missing file or organization ID");
      showToast("Please select a file and ensure organization is saved first", "warning");
      return;
    }
    
    try {
      setUploadingImage(true);
      console.log("📤 Uploading profile image for organization:", organization.id);
      console.log("🌐 Backend URL:", process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
      
      const result = await uploadOrganizationProfile(organization.id, selectedFile);
      console.log("✅ Upload success, parsed result:", result);
      console.log("🖼️ Profile image URL:", result.profile_image_url);
      
      setProfileImage(result.profile_image_url);
      setSelectedFile(null);
      showToast("Profile image uploaded successfully!", "success");
      
      // Refresh organization data to get updated profile image
      if (onRefresh) {
        console.log("🔄 Refreshing organization data...");
        await onRefresh();
        console.log("✅ Refresh completed");
      }
    } catch (err: any) {
      console.error("❌ Upload failed:", err);
      console.error("❌ Error details:", {
        message: err?.message,
        code: err?.code,
        response: err?.response,
        stack: err?.stack,
      });
      
      // Show more user-friendly error messages
      let errorMsg = "Failed to upload image";
      
      if (err?.message?.includes('Network error') || err?.message === 'Network Error') {
        errorMsg = "Cannot connect to server. Please ensure the backend is running at http://localhost:8000";
      } else if (err?.message?.includes('timeout')) {
        errorMsg = "Upload timeout. Please try with a smaller image.";
      } else if (err?.message?.includes('Endpoint not found')) {
        errorMsg = "Upload endpoint not available. Please contact administrator.";
      } else if (err?.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Organization name is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    // Validate admin fields if auto_create_admin is enabled and fields are provided
    if (!organization && formData.auto_create_admin) {
      // If admin_email is provided, validate it
      if (formData.admin_email && !formData.admin_email.includes('@')) {
        setError("Invalid email format for admin email");
        return;
      }

      // If admin_password is provided, validate minimum length
      if (formData.admin_password && formData.admin_password.length < 8) {
        setError("Admin password must be at least 8 characters");
        return;
      }
    }

    try {
      setSubmitting(true);
      
      // Prepare payload - remove auto_create_admin fields if editing
      const basePayload = organization
        ? {
            name: formData.name,
            description: formData.description,
          }
        : formData; // Include all fields including auto_create_admin for new org

      // Include subscription selection (plan/duration) — backend will persist subscription instead of expired_date
      const payload = {
        ...basePayload,
        plan_id: selectedPlanId || undefined,
        duration_months: selectedDurationMonths || undefined,
      };

      console.log("📤 Submitting payload:", payload);
      
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      console.error("Form submission error:", err);
      
      // Handle validation errors from backend
      let errorMessage = "Failed to save organization";
      
      if (err?.response?.status === 422) {
        const detail = err.response.data?.detail;
        if (Array.isArray(detail)) {
          const fieldErrors = detail.map((error: any) => {
            const field = error.loc?.[1] || error.loc?.[0] || 'field';
            return `${field}: ${error.msg}`;
          }).join(', ');
          errorMessage = fieldErrors;
        } else if (typeof detail === 'string') {
          errorMessage = detail;
        }
      } else if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold font-inter text-gray-900 mb-6">
        {organization ? "Edit Organization" : "Create New Organization"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Image Upload - Only for editing existing organization */}
        {organization && (
          <div>
            <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
              Profile Image
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting || uploadingImage}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-inter font-medium disabled:opacity-50"
                >
                  Choose Image
                </button>
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={uploadingImage || submitting}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-inter font-medium disabled:opacity-50"
                  >
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 font-inter">
              Recommended: Square image, max 5MB (JPG, PNG, GIF)
            </p>
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
            Organization Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter organization name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={submitting}
          />
        </div>

        {/* Expiry Date (computed from selected subscription) */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
            Subscription Plan
          </label>
          <select
            name="subscription_plan"
            value={selectedPlanId || ""}
            onChange={(e) => handlePlanChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={submitting}
          >
            <option value="">-- Select plan --</option>
            {plans.map((p) => (
              <option key={p.plan_id} value={p.plan_id}>
                {p.name}
              </option>
            ))}
          </select>

          {selectedPlanId && (
            <div className="mt-3">
              <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
                Duration (months)
              </label>
              <select
                name="subscription_duration"
                value={selectedDurationMonths ?? ""}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                disabled={submitting}
              >
                <option value="">-- Select duration --</option>
                {Object.keys(plans.find((x) => x.plan_id === selectedPlanId)?.prices_by_duration_months || {})
                  .map((k) => Number(k))
                  .map((months) => (
                    <option key={months} value={months}>
                      {months} month{months > 1 ? "s" : ""}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="mt-3">
            <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
              Expiry Date (preview)
            </label>
            <input
              type="date"
              value={displayExpiry}
              readOnly
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50 placeholder-gray-400 font-inter text-gray-900 focus:outline-none transition"
              disabled
            />
            <p className="text-xs text-gray-500 mt-2 font-inter">Expiry preview (not stored directly) — backend uses subscription status.</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
            Description
          </label>
          <textarea
            name="description"
            placeholder="Enter organization description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            disabled={submitting}
          />
        </div>

        {/* Auto Create Admin Section - Only show when creating new organization */}
        {!organization && (
          <div className="border-t border-gray-200 pt-5 mt-2">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                name="auto_create_admin"
                checked={formData.auto_create_admin}
                onChange={(e) => setFormData(prev => ({ ...prev, auto_create_admin: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={submitting}
              />
              <label className="text-sm font-medium font-inter text-gray-900">
                Auto-create admin user for this organization
              </label>
            </div>

            {formData.auto_create_admin && (
              <div className="space-y-4 pl-7 border-l-2 border-blue-200">
                <p className="text-xs text-gray-500 font-inter mb-3">
                  Leave fields empty to auto-generate credentials
                </p>

                {/* Admin Name */}
                <div>
                  <label className="block text-sm font-medium font-inter text-gray-700 mb-2">
                    Admin Name <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="admin_name"
                    placeholder="e.g., Admin PT ABC"
                    value={formData.admin_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    disabled={submitting}
                  />
                </div>

                {/* Admin Email */}
                <div>
                  <label className="block text-sm font-medium font-inter text-gray-700 mb-2">
                    Admin Email <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    name="admin_email"
                    placeholder="e.g., admin@ptabc.com"
                    value={formData.admin_email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    disabled={submitting}
                  />
                </div>

                {/* Admin Password */}
                <div>
                  <label className="block text-sm font-medium font-inter text-gray-700 mb-2">
                    Admin Password <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    name="admin_password"
                    placeholder="Minimum 8 characters"
                    value={formData.admin_password}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
                    disabled={submitting}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-inter text-red-600">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-900 font-inter font-medium rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-inter font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : organization
              ? "Update Organization"
              : "Create Organization"}
          </button>
        </div>
      </form>
    </div>
  );
}
