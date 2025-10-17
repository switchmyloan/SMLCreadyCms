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
                                        <p className="text-gray-700 font-medium">{lead.phone}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Email:</p>
                                        <p className="text-gray-700 font-medium">{lead.email ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Gender:</p>
                                        <p className="text-gray-700 font-medium">{lead.gender}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Date of Birth:</p>
                                        <p className="text-gray-700 font-medium">{new Date(lead.dob).toLocaleDateString()}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Loan Amount:</p>
                                        <p className="text-gray-700 font-medium">{lead.loanAmount ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Salary:</p>
                                        <p className="text-gray-700 font-medium">{lead.salary ?? "Not Provided"}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Pin Code:</p>
                                        <p className="text-gray-700 font-medium">{lead.pincode ?? "Not Provided"}</p>
                                    </div>


                                    <div>
                                        <p className="text-sm font-medium text-gray-700">PAN Number:</p>
                                        <p className="text-gray-700 font-medium">{lead.panNumber}</p>
                                    </div>


                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Profession:</p>
                                        <p className="text-gray-700 font-medium">{lead.profession ?? "Not Provided"}</p>
                                    </div>

                    

                                  

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Created At:</p>
                                        <p className="text-gray-700 font-medium">{new Date(lead.consentDatetime).toLocaleString()}</p>
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
