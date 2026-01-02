"use client";

import { useState, useEffect, useRef } from "react";
import { User, CreateUserPayload, uploadUserProfile } from "@/services/user";
import { Organization } from "@/services/organization";
import { getLoggedInUser, isAdmin, isSuperAdmin } from "@/services/tokenUtils";
import { useToastContext } from "./ToastProvider";
import Image from "next/image";

interface UserFormProps {
  user: User | null;
  isLoading: boolean;
  onSubmit: (data: CreateUserPayload) => Promise<void>;
  onClose: () => void;
  isCreate?: boolean;
  organizations: Organization[];
}

export default function UserForm({
  user,
  isLoading,
  onSubmit,
  onClose,
  isCreate = false,
  organizations,
}: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserPayload>({
    name: "",
    email: "",
    password: "",
    role: "user",
    organization_id: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdminLoggedIn = isAdmin();
  const shouldLockRoleToUser = isCreate && isAdminLoggedIn && !user;
  const { showToast } = useToastContext();

  useEffect(() => {
    // Get logged in user's organization_id
    const loggedInUser = getLoggedInUser();
    const userOrgId = loggedInUser?.organization_id;
    
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Don't show password when editing
        role: user.role,
        organization_id: user.organization_id || userOrgId || "",
      });
      setProfileImage(user.profile_image_url || null);
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        organization_id: userOrgId || "",
      });
      setProfileImage(null);
    }
    setError("");
    setSelectedFile(null);
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
      
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !user?.id) return;
    
    try {
      setUploadingImage(true);
      const result = await uploadUserProfile(user.id, selectedFile);
      setProfileImage(result.profile_image_url);
      setSelectedFile(null);
      showToast("Profile image uploaded successfully!", "success");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || err?.message || "Failed to upload image";
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
      setError("User name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    if (isCreate && !formData.password.trim()) {
      setError("Password is required for new users");
      return;
    }

    if (!formData.role) {
      setError("Role is required");
      return;
    }

    try {
      setSubmitting(true);
      const finalData = shouldLockRoleToUser
        ? { ...formData, role: "user" }
        : formData;
      await onSubmit(finalData);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold font-inter text-gray-900 mb-6">
        {user ? "Edit User" : "Create New User"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Image Upload - Only for editing existing user */}
        {/* TODO: Enable this when backend endpoint is ready */}
        {false && user && (
          <div>
            <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
              Profile Image
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-300">
                {profileImage && typeof profileImage === 'string' ? (
                  <Image
                    src={profileImage!}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
            Full Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={submitting}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            disabled={submitting}
          />
        </div>

        {/* Password - Only show on create */}
        {isCreate && (
          <div>
            <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={submitting}
            />
          </div>
        )}

        {/* Organization - Only show for super admin */}
        {isSuperAdmin() && (
          <div>
            <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
              Organization
            </label>
            <select
              name="organization_id"
              value={formData.organization_id}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={submitting}
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {!shouldLockRoleToUser && (
          <div>
            <label className="block text-sm font-medium font-inter text-gray-900 mb-2">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white placeholder-gray-400 font-inter text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              disabled={submitting}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
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
              : user
              ? "Update User"
              : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
}
