import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Link from "next/link";

const mockRental = {
  vehicle: "2020 Toyota Camry SE",
  status: "Active",
  startDate: "Apr 21, 2026",
  endDate: "Apr 28, 2026",
  weeklyRate: 325,
  deposit: 400,
  amountPaid: 725,
  nextPayment: "Apr 28, 2026",
  pickupLocation: "4910 Griggs Rd, Houston, TX 77021",
  pickupTime: "9:00 AM",
};

const docs = [
  { name: "Rental Agreement", date: "Apr 21, 2026", status: "Signed" },
  { name: "Insurance Certificate", date: "Apr 21, 2026", status: "On File" },
  { name: "Vehicle Inspection Report", date: "Apr 21, 2026", status: "Completed" },
];

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-[#2952CC] text-sm font-semibold uppercase tracking-widest mb-2">
            My Account
          </p>
          <h1 className="text-3xl font-black text-white">Customer Portal</h1>
          <p className="text-[#7A8B9A] mt-2">
            Manage your rental, view documents, and contact support.
          </p>
        </div>

        {/* Status Banner */}
        <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-2xl p-4 sm:p-6 flex items-start sm:items-center gap-4 mb-8 flex-col sm:flex-row">
          <div className="w-10 h-10 bg-emerald-400/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-400 text-lg"></span>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold">Rental Active — {mockRental.vehicle}</p>
            <p className="text-emerald-400 text-sm">
              {mockRental.startDate} → {mockRental.endDate}
            </p>
          </div>
          <span className="px-3 py-1.5 bg-emerald-400/15 border border-emerald-400/20 rounded-full text-emerald-400 text-xs font-semibold">
            {mockRental.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Reservation Details */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Reservation Details</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: "Vehicle", value: mockRental.vehicle },
                  { label: "Rental Period", value: `${mockRental.startDate} – ${mockRental.endDate}` },
                  { label: "Weekly Rate", value: `$${mockRental.weeklyRate}` },
                  { label: "Deposit Paid", value: `$${mockRental.deposit}` },
                  { label: "Total Paid", value: `$${mockRental.amountPaid}` },
                  { label: "Next Payment", value: mockRental.nextPayment },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[#7A8B9A] text-xs uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-white font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pickup Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Pickup Information</h2>
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5"></span>
                  <div>
                    <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-0.5">Location</p>
                    <p className="text-white font-medium">{mockRental.pickupLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5"></span>
                  <div>
                    <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-0.5">Pickup Time</p>
                    <p className="text-white font-medium">{mockRental.pickupTime}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5"></span>
                  <div>
                    <p className="text-xs text-[#7A8B9A] uppercase tracking-wider mb-0.5">What to Bring</p>
                    <p className="text-white font-medium">Valid TX license · Deposit cash/card · Insurance if personal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Documents</h2>
              <div className="flex flex-col gap-3">
                {docs.map((doc) => (
                  <div
                    key={doc.name}
                    className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{doc.name}</p>
                      <p className="text-[#7A8B9A] text-xs">{doc.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                        {doc.status}
                      </span>
                      <button className="text-xs text-[#2952CC] hover:text-[#3561e0] font-medium transition-colors">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Payment Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Payment</h2>
              <div className="flex flex-col gap-2 text-sm mb-4">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-[#7A8B9A]">Amount Paid</span>
                  <span className="text-emerald-400 font-semibold">${mockRental.amountPaid}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#7A8B9A]">Next Due</span>
                  <span className="text-white font-semibold">{mockRental.nextPayment}</span>
                </div>
              </div>
              <button className="w-full py-3 bg-[#2952CC] text-white font-bold rounded-xl hover:bg-[#3561e0] transition-colors text-sm">
                Make Payment
              </button>
            </div>

            {/* Support */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-4">Support</h2>
              <p className="text-[#7A8B9A] text-sm mb-4">
                Need help with your rental? Our team is available 7 days a week.
              </p>
              <div className="flex flex-col gap-2">
                <a
                  href="tel:8000000000"
                  className="w-full py-3 text-center border border-gray-700 text-[#7A8B9A] font-medium rounded-xl hover:border-gray-500 hover:text-white transition-colors text-sm"
                >
                  (800) 000-0000
                </a>
                <a
                  href="mailto:hello@sureshiftrentals.com"
                  className="w-full py-3 text-center border border-gray-700 text-[#7A8B9A] font-medium rounded-xl hover:border-gray-500 hover:text-white transition-colors text-sm"
                >
                   Email Support
                </a>
                <Link
                  href="/contact"
                  className="w-full py-3 text-center border border-gray-700 text-[#7A8B9A] font-medium rounded-xl hover:border-gray-500 hover:text-white transition-colors text-sm"
                >
                  Contact Form
                </Link>
              </div>
            </div>

            {/* Extend */}
            <div className="bg-[#2952CC]/10 border border-[#2952CC]/20 rounded-2xl p-5">
              <p className="text-[#2952CC] font-semibold text-sm mb-2">Need More Time?</p>
              <p className="text-[#7A8B9A] text-xs mb-3">
                Extending your rental is easy. Call us or text and we'll handle it.
              </p>
              <a
                href="tel:8000000000"
                className="text-[#2952CC] text-sm font-bold hover:underline"
              >
                Call to Extend →
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
