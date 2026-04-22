export type VehicleStatus = "Available Now" | "Available Tomorrow" | "Reserved";

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  weeklyRate: number;
  deposit: number;
  status: VehicleStatus;
  tags: string[];
  description: string;
  specs: {
    transmission: string;
    fuel: string;
    seats: number;
    mileagePolicy: string;
    insurance: string;
  };
  requirements: string[];
  color: string;
  imageColor: string; // for placeholder gradient
}

const vehicles: Vehicle[] = [
  {
    id: "2019-toyota-camry",
    year: 2019,
    make: "Toyota",
    model: "Camry",
    weeklyRate: 275,
    deposit: 300,
    status: "Available Now",
    tags: ["Gig Work Ready", "Uber/Lyft OK", "Spacious"],
    description:
      "The Toyota Camry is the gold standard for gig work. Smooth ride, roomy interior for passengers, and rock-solid reliability that keeps you earning — not in the shop.",
    specs: {
      transmission: "Automatic",
      fuel: "Gasoline",
      seats: 5,
      mileagePolicy: "Unlimited miles",
      insurance: "Liability included",
    },
    requirements: [
      "Valid Texas driver's license",
      "Must be 21+ years old",
      "Rideshare account (Uber/Lyft) required for gig tier",
      "$300 refundable deposit",
      "No major violations in last 3 years",
    ],
    color: "Midnight Black",
    imageColor: "from-gray-800 to-gray-900",
  },
  {
    id: "2020-nissan-altima",
    year: 2020,
    make: "Nissan",
    model: "Altima",
    weeklyRate: 275,
    deposit: 300,
    status: "Available Now",
    tags: ["Uber/Lyft OK", "Fuel Efficient", "Comfortable"],
    description:
      "The 2020 Altima is built for the long haul. Variable compression engine sips gas while keeping you comfortable through long Houston shifts. A driver's favorite.",
    specs: {
      transmission: "CVT Automatic",
      fuel: "Gasoline",
      seats: 5,
      mileagePolicy: "Unlimited miles",
      insurance: "Liability included",
    },
    requirements: [
      "Valid Texas driver's license",
      "Must be 21+ years old",
      "Rideshare account (Uber/Lyft) required for gig tier",
      "$300 refundable deposit",
      "No major violations in last 3 years",
    ],
    color: "Pearl White",
    imageColor: "from-slate-700 to-slate-900",
  },
  {
    id: "2018-toyota-corolla",
    year: 2018,
    make: "Toyota",
    model: "Corolla",
    weeklyRate: 275,
    deposit: 300,
    status: "Available Tomorrow",
    tags: ["Fuel Efficient", "Easy to Drive", "Reliable"],
    description:
      "When you want to maximize every dollar earned, the Corolla delivers. Outstanding fuel economy and legendary Toyota reliability make this the commuter's best friend.",
    specs: {
      transmission: "Automatic",
      fuel: "Gasoline",
      seats: 5,
      mileagePolicy: "Unlimited miles",
      insurance: "Liability included",
    },
    requirements: [
      "Valid Texas driver's license",
      "Must be 21+ years old",
      "$300 refundable deposit",
      "No major violations in last 3 years",
    ],
    color: "Classic Silver",
    imageColor: "from-zinc-700 to-zinc-900",
  },
  {
    id: "2021-ford-fusion",
    year: 2021,
    make: "Ford",
    model: "Fusion",
    weeklyRate: 300,
    deposit: 350,
    status: "Available Now",
    tags: ["Gig Work Ready", "Uber/Lyft OK", "Spacious Trunk"],
    description:
      "The Ford Fusion SE brings American reliability to your hustle. Generous trunk space, smooth highway ride, and a premium interior that your passengers will notice.",
    specs: {
      transmission: "Automatic",
      fuel: "Gasoline",
      seats: 5,
      mileagePolicy: "Unlimited miles",
      insurance: "Liability included",
    },
    requirements: [
      "Valid Texas driver's license",
      "Must be 21+ years old",
      "Rideshare account (Uber/Lyft) required for gig tier",
      "$350 refundable deposit",
      "No major violations in last 3 years",
    ],
    color: "Deep Blue",
    imageColor: "from-blue-900 to-blue-950",
  },
  {
    id: "2019-nissan-sentra",
    year: 2019,
    make: "Nissan",
    model: "Sentra",
    weeklyRate: 275,
    deposit: 300,
    status: "Reserved",
    tags: ["Commuter Friendly", "Fuel Efficient", "Compact"],
    description:
      "Perfect for daily commuters who need something dependable without breaking the bank. The Sentra is compact enough for easy city parking and efficient enough to keep fuel costs low.",
    specs: {
      transmission: "CVT Automatic",
      fuel: "Gasoline",
      seats: 5,
      mileagePolicy: "Unlimited miles",
      insurance: "Liability included",
    },
    requirements: [
      "Valid Texas driver's license",
      "Must be 21+ years old",
      "$300 refundable deposit",
      "No major violations in last 3 years",
    ],
    color: "Gunmetal Gray",
    imageColor: "from-gray-700 to-gray-900",
  },
  {
    id: "2020-toyota-camry-se",
    year: 2020,
    make: "Toyota",
    model: "Camry SE",
    trim: "SE",
    weeklyRate: 325,
    deposit: 400,
    status: "Available Now",
    tags: ["Premium Option", "Uber/Lyft OK", "Sport Interior", "5-Star Rated"],
    description:
      "Step up your game with the Camry SE. Sport-tuned suspension, upgraded interior, and the kind of presence that earns better tips. This is the vehicle for drivers who want to stand out.",
    specs: {
      transmission: "Automatic",
      fuel: "Gasoline",
      seats: 5,
      mileagePolicy: "Unlimited miles",
      insurance: "Liability included",
    },
    requirements: [
      "Valid Texas driver's license",
      "Must be 23+ years old",
      "Rideshare account (Uber/Lyft) required for gig tier",
      "$400 refundable deposit",
      "Clean driving record — no major violations in last 5 years",
    ],
    color: "Phantom Black",
    imageColor: "from-neutral-800 to-black",
  },
];

export default vehicles;

export function getVehicleById(id: string): Vehicle | undefined {
  return vehicles.find((v) => v.id === id);
}
