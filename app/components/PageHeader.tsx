"use client";

import Link from "next/link";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbItems: BreadcrumbItem[];
    children?: React.ReactNode;
}

export default function PageHeader({ title, description, breadcrumbItems, children }: PageHeaderProps) {
    return (
        <div className="mb-2">
            {/* Breadcrumbs */}
            <nav className="flex items-center text-sm text-gray-500 mb-2 font-inter">
                {breadcrumbItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                        {index > 0 && (
                            <ChevronRightIcon className="w-4 h-4 mx-1 text-gray-400" />
                        )}
                        {item.href ? (
                            <Link
                                href={item.href}
                                className="hover:text-blue-600 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={index === breadcrumbItems.length - 1 ? "text-gray-900 font-medium" : ""}>
                                {item.label}
                            </span>
                        )}
                    </div>
                ))}
            </nav>

            {/* Title and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold font-inter text-gray-900">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-gray-600 mt-2 font-inter">
                            {description}
                        </p>
                    )}
                </div>
                {children}
            </div>
        </div>
    );
}
