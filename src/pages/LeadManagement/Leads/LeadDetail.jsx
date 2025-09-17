"use client";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function Tabs() {
    const location = useLocation();
    const lead = location.state?.lead; // 👈 yahan pe data mil jayega

    const [activeTab, setActiveTab] = useState("Basic");

    const tabs = ["Basic"];

    console.log("Lead Data:", lead); // 👈 Check if data is received correctly
    return (
        <>
            <div className="w-full">
                <div className="bg-white rounded-lg shadow-sm p-2 flex space-x-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${activeTab === tab
                                    ? "bg-indigo-100 text-indigo-600" // ✅ Active tab style (brand color Indigo)
                                    : "text-gray-600 hover:text-indigo-600"
                                }
            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>




            {/* 🔹 Tab Content */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
                {activeTab === "Basic" && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Info</h2>
                        {lead ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-12">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        First Name:
                                    </p>
                                    <p className="text-gray-900">{lead.firstName}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Last Name:</p>
                                    <p className="text-gray-900">{lead.lastName}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Biometric:</p>
                                    <p className="text-gray-900">
                                        {lead.isBioMetricEnabled ? "Enabled" : "Disabled"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Email:</p>
                                    <p className="text-gray-900">
                                        {lead.isEmailVerified ? "Verified" : "Not Verified"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Getting Offers:
                                    </p>
                                    <p className="text-gray-900">
                                        {lead.isGettingOffers ? "Enabled" : "Disabled"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">M-Pin:</p>
                                    <p className="text-gray-900">
                                        {lead.isMpinEnabled ? "Verified" : "Not Verified"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        PAN Verification:
                                    </p>
                                    <p className="text-gray-900">
                                        {lead.isPANVerified ? "Enabled" : "Disabled"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Phone Verification:
                                    </p>
                                    <p className="text-gray-900">
                                        {lead.isPhoneVerified ? "Verified" : "Not Verified"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Profile Completion:
                                    </p>
                                    <p className="text-gray-900">
                                        {lead.isProfileCompleted ? "Enabled" : "Disabled"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">Suspended:</p>
                                    <p className="text-gray-900">
                                        {lead.isSuspended ? "Yes" : "No"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-700">
                                        Phone Number:
                                    </p>
                                    <p className="text-gray-900">{lead.phoneNumber}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500">No lead data available.</p>
                        )}
                    </div>
                )}

                {activeTab === "Advanced" && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Advanced Settings</h2>
                        <p className="text-gray-600 mt-2">
                            Content for the <strong>Advanced</strong> tab goes here.
                        </p>
                    </div>
                )}

                {activeTab === "Settings" && (
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
                        <p className="text-gray-600 mt-2">
                            Content for the <strong>Settings</strong> tab goes here.
                        </p>
                    </div>
                )}
            </div>

        </>
    );
}
