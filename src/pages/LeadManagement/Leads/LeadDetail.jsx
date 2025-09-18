"use client";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function Tabs() {
    const location = useLocation();
    const lead = location.state?.lead; // 👈 yahan pe data mil jayega

    const [activeTab, setActiveTab] = useState("Basic");

    const tabs = ["Basic", "MF"];

    console.log("Lead Data:", lead); // 👈 Check if data is received correctly
    return (
        <>
            <div className="w-full">
                <div className="rounded-lg shadow-sm px-4">
                    <div className="flex space-x-8 ">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`relative pb-2 text-sm font-medium transition-colors
                  ${activeTab === tab
                                        ? "text-indigo-600"
                                        : "text-gray-600 hover:text-indigo-600"
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <span className="absolute left-0 -bottom-[1px] h-0.5 w-full bg-indigo-600 rounded"></span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>





                {/* 🔹 Tab Content */}
                <div className="mt-4 p-4 rounded-lg shadow-sm">
                    {activeTab === "Basic" && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Info</h2>
                            {lead ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-12">
                                
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">First Name:</p>
                                        <p className="text-gray-700 font-medium">{lead.firstName}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Last Name:</p>
                                        <p className="text-gray-700 font-medium">{lead.lastName}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Phone Number:</p>
                                        <p className="text-gray-700 font-medium">{lead.phoneNumber}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Email:</p>
                                        <p className="text-gray-700 font-medium">{lead.emailAddress ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Gender:</p>
                                        <p className="text-gray-700 font-medium">{lead.gender}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Date of Birth:</p>
                                        <p className="text-gray-700 font-medium">{new Date(lead.dateOfBirth).toLocaleDateString()}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Address:</p>
                                        <p className="text-gray-700 font-medium">{lead.address ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">City:</p>
                                        <p className="text-gray-700 font-medium">{lead.city ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">State:</p>
                                        <p className="text-gray-700 font-medium">{lead.state ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Country:</p>
                                        <p className="text-gray-700 font-medium">{lead.country ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Postal Code:</p>
                                        <p className="text-gray-700 font-medium">{lead.postalCode ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Profile Image:</p>
                                        <p className="text-gray-700 font-medium">{lead.profileImage ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">PAN Number:</p>
                                        <p className="text-gray-700 font-medium">{lead.panNumber}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Job Type:</p>
                                        <p className="text-gray-700 font-medium">{lead.jobType}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Monthly Income:</p>
                                        <p className="text-gray-700 font-medium">₹{Number(lead.monthlyIncome).toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Biometric:</p>
                                        <p className="text-gray-700 font-medium">{lead.isBioMetricEnabled ? "Enabled" : "Disabled"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Email Verification:</p>
                                        <p className="text-gray-700 font-medium">{lead.isEmailVerified ? "Verified" : "Not Verified"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Getting Offers:</p>
                                        <p className="text-gray-700 font-medium">{lead.isGettingOffers ? "Enabled" : "Disabled"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">M-Pin:</p>
                                        <p className="text-gray-700 font-medium">{lead.isMpinEnabled ? "Verified" : "Not Verified"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">PAN Verification:</p>
                                        <p className="text-gray-700 font-medium">{lead.isPANVerified ? "Enabled" : "Disabled"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Phone Verification:</p>
                                        <p className="text-gray-700 font-medium">{lead.isPhoneVerified ? "Verified" : "Not Verified"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Profile Completion:</p>
                                        <p className="text-gray-700 font-medium">{lead.isProfileCompleted ? "Enabled" : "Disabled"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Suspended:</p>
                                        <p className="text-gray-700 font-medium">{lead.isSuspended ? "Yes" : "No"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Created At:</p>
                                        <p className="text-gray-700 font-medium">{new Date(lead.createdAt).toLocaleString()}</p>
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
            </div>

        </>
    );
}
