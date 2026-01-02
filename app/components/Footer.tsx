"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-8">
        <p className="text-sm text-gray-600 font-inter text-center">
          © {currentYear} PEDDA AI AMANITECH. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
