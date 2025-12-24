"use client";
import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function Tabs() {
    const location = useLocation();
    const lead = location.state?.lead; // 👈 yahan pe data mil jayega

    const [activeTab, setActiveTab] = useState("Basic");

    const tabs = ["Basic", "Offers", "UTM"];

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
                    {/* OFFERS TAB */}
                    {activeTab === "Offers" && (
                        <section title="Lender Offers">
                            {lead?.lender_responses?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {lead.lender_responses.map((offer, index) => (
                                        <div
                                            key={index}
                                            className="rounded-2xl border shadow-sm bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                                        >
                                            {/* Top Accent Bar */}
                                            <div className="h-2 w-full bg-gradient-to-r from-blue-600 to-purple-600"></div>

                                            <div className="p-5">
                                                {/* Lender Header */}
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-15 h-15 flex items-center justify-center bg-gray-50">
                                                        <img
                                                            src={import.meta.env.VITE_IMAGE_URL + offer.lender.logo}
                                                            alt={offer.lender.name}
                                                            className="w-12 h-12 object-contain"
                                                        />
                                                    </div>

                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {offer.lender.name}
                                                        </h3>

                                                        {/* Badge */}
                                                        <span
                                                            className={`text-xs px-2 py-1 rounded-md font-medium ${offer.isOffer
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            {offer.isOffer ? "Offer Available" : "No Offer"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Offer Details */}
                                                <div className="text-sm text-gray-700 space-y-2">
                                                    <p>
                                                        <strong>Interest Rate:</strong> {offer.lender.startingInterestRate}
                                                    </p>

                                                    <p>
                                                        <strong>Loan Range:</strong> ₹{offer.lender.minimumLoanAmount} – ₹
                                                        {offer.lender.maximumLoanAmount}
                                                    </p>

                                                    <p>
                                                        <strong>Tenure:</strong> {offer.lender.minimumTenure} –{" "}
                                                        {offer.lender.maximumTenure} months
                                                    </p>
                                                </div>

                                                {/* Visit Lender Button */}
                                                <a
                                                    href={offer.lender.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-5 inline-block w-full text-center bg-blue-500 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition"
                                                >
                                                    Visit Lender Website →
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No offers available for this lead.</p>
                            )}
                        </section>
                    )}



                    {activeTab === "UTM" && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                UTM Details
                            </h2>

                            {lead?.utm_header ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-12">

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">UTM Source</p>
                                        <p className="text-gray-800 font-medium">
                                            {lead?.utm_header?.utm_source || "NA"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">UTM Medium</p>
                                        <p className="text-gray-800 font-medium">
                                            {lead?.utm_header?.utm_medium || "NA"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">UTM Campaign</p>
                                        <p className="text-gray-800 font-medium">
                                            {lead?.utm_header?.utm_campaign || "NA"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700">UTM Affiliate ID</p>
                                        <p className="text-gray-800 font-medium">
                                            {lead?.utm_header?.utm_affid || "NA"}
                                        </p>
                                    </div>

                                    <div className="md:col-span-3">
                                        <p className="text-sm font-medium text-gray-700">UTM Link</p>
                                        {lead.utm_header.utm_link && lead.utm_header.utm_link !== "NA" ? (
                                            <a
                                                href={lead.utm_header.utm_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:underline break-all"
                                            >
                                                {lead.utm_header.utm_link}
                                            </a>
                                        ) : (
                                            <p className="text-gray-800 font-medium">NA</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-3">
                                        <p className="text-sm font-medium text-gray-700">Redirected URL</p>
                                        {lead?.utm_header?.redirected_url ? (
                                            <a
                                                href={lead?.utm_header?.redirected_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-indigo-600 hover:underline break-all"
                                            >
                                                {lead?.utm_header?.redirected_url}
                                            </a>
                                        ) : (
                                            <p className="text-gray-800 font-medium">NA</p>
                                        )}
                                    </div>

                                </div>
                            ) : (
                                <p className="text-gray-500">No UTM data available.</p>
                            )}
                        </div>
                    )}

                </div>
            </div>

        </>
    );
}
