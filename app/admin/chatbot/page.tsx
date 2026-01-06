"use client";

import ChatbotTable from "../../components/ChatbotTable";
import ChatbotForm from "../../components/ChatbotForm";
import CreateChatbotForm from "../../components/CreateChatbotForm";
import SlideSheet from "../../components/SlideSheet";
import DeleteModal from "../../components/DeleteModal";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getChatbots,
  createChatbot,
  updateChatbot,
  deleteChatbot,
  Chatbot,
  CreateChatbotPayload,
} from "@/services/chatbot";
import { useToastContext } from "../../components/ToastProvider";
import { getLoggedInUser, isSuperAdmin } from "@/services/tokenUtils";
import PageHeader from "../../components/PageHeader";

export default function ChatbotPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoadingChatbots, setIsLoadingChatbots] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [newChatbot, setNewChatbot] = useState<Chatbot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Chatbot | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isSuper, setIsSuper] = useState(false);
  const router = useRouter();
  const { showToast } = useToastContext();

  // Load chatbots
  useEffect(() => {
    // Check if user is super admin
    const userIsSuperAdmin = isSuperAdmin();
    setIsSuper(userIsSuperAdmin);

    const user = getLoggedInUser();
    console.log("Chatbot page - User info:", {
      role: user?.role,
      isSuperAdmin: userIsSuperAdmin,
      hasOrgId: !!user?.organization_id,
      orgId: user?.organization_id
    });

    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      setIsLoadingChatbots(true);
      const data = await getChatbots();
      setChatbots(data);
    } catch (error) {
      console.error("Error loading chatbots:", error);
      showToast("Failed to load chatbots", "error");
    } finally {
      setIsLoadingChatbots(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Logout handled in layout
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  };

  const handleOpenForm = (chatbot?: Chatbot) => {
    setSelectedChatbot(chatbot || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedChatbot(null);
    setNewChatbot(null);
    // Refresh data when closing form to ensure list is up to date
    fetchChatbots();
  };

  const handleSubmitForm = async (data: CreateChatbotPayload) => {
    try {
      if (selectedChatbot) {
        // Update existing chatbot
        await updateChatbot(selectedChatbot.id, data);
        showToast("Chatbot updated successfully", "success");
        // Refresh chatbots list
        await fetchChatbots();
        handleCloseForm();
      } else {
        // Create new chatbot
        const createdChatbot = await createChatbot(data);
        console.log("Chatbot created:", createdChatbot);
        showToast("Chatbot created successfully", "success");
        // Set the newly created chatbot to show ingestion section
        setNewChatbot(createdChatbot);
        // Refresh chatbots list immediately to show new chatbot
        await fetchChatbots();
        // Don't close form - let user see ingestion section
      }
    } catch (error: any) {
      showToast(error?.response?.data?.detail || "Failed to save chatbot", "error");
      throw error;
    }
  };

  const handleDelete = (chatbot: Chatbot) => {
    setDeleteTarget(chatbot);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleteLoading(true);
      console.log("🗑️ Attempting to delete chatbot:", deleteTarget.id, "Name:", deleteTarget.name);

      await deleteChatbot(deleteTarget.id);

      console.log("✅ Delete successful, refreshing chatbot list...");
      await fetchChatbots();

      setDeleteTarget(null);
      showToast("Chatbot deleted successfully", "success");
    } catch (error: any) {
      console.error("❌ Error in handleConfirmDelete:", error);

      // Extract error message
      const errorMessage = error?.message
        || error?.response?.data?.detail
        || error?.response?.data?.message
        || "Failed to delete chatbot";

      showToast(errorMessage, "error");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <div>

      {/* Header */}
      <PageHeader
        title="Agent Management"
        description={isSuper
          ? "Create and manage your agent instances"
          : "Manage your agent instances"}
        breadcrumbItems={[
          { label: "Pages" },
          { label: "AI Agents", href: "/admin/chatbot" }
        ]}
      >
        {/* Only show Create button for super admin */}
        {isSuper && (
          <button
            onClick={() => handleOpenForm()}
            className="px-6 py-3 bg-blue-600 text-white font-inter font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center sm:justify-start"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New Agent
          </button>
        )}
      </PageHeader>

      {/* Table */}
      <ChatbotTable
        chatbots={chatbots}
        isLoading={isLoadingChatbots}
        onEdit={handleOpenForm}
        onDelete={handleDelete}
        isSuperAdmin={isSuper}
      />


      {/* Slide Sheet for Create Form */}
      <SlideSheet
        isOpen={isFormOpen && !selectedChatbot}
        onClose={handleCloseForm}
        title="Create New Agent"
        width="500px"
        orientation="right"
      >
        <CreateChatbotForm
          createdChatbot={newChatbot}
          isLoading={isFormOpen}
          onSubmit={handleSubmitForm}
          onClose={handleCloseForm}
        />
      </SlideSheet>

      {/* Slide Sheet for Edit Form */}
      <SlideSheet
        isOpen={isFormOpen && !!selectedChatbot}
        onClose={handleCloseForm}
        title="Edit Agent"
        width="500px"
        orientation="right"
      >
        {selectedChatbot && (
          <ChatbotForm
            chatbot={selectedChatbot}
            isLoading={isFormOpen}
            onSubmit={handleSubmitForm}
            onClose={handleCloseForm}
          />
        )}
      </SlideSheet>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        isLoading={isDeleteLoading}
        title="Delete Agent"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
