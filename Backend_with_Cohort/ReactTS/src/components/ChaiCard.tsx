import Counter from "./Counter";

interface ChaiCardProps {
  name: string;
  rolleNumber: string;
  age: string;
  isActive?: boolean;
  gender: string;
  email: string;
  phone: string;
  address: string;
}

const ChaiCard = ({
  name,
  rolleNumber,
  age,
  isActive,
  gender,
  email,
  phone,
  address,
}: ChaiCardProps) => {
  return (
    <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-6 mx-auto my-8 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}
          />
          <h2 className="text-2xl font-bold text-gray-900">{name}</h2>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <span className="text-gray-500">Roll No:</span>
          <p className="font-semibold text-gray-900">{rolleNumber}</p>
        </div>
        <div>
          <span className="text-gray-500">Age:</span>
          <p className="font-semibold text-gray-900">{age}</p>
        </div>
        <div>
          <span className="text-gray-500">Gender:</span>
          <p className="font-semibold text-gray-900 capitalize">{gender}</p>
        </div>
        <div className="col-span-2">
          <span className="text-gray-500">Address:</span>
          <p className="font-semibold text-gray-900">{address}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <span className="text-gray-500 block text-sm mb-1">Email:</span>
          <a
            href={`mailto:${email}`}
            className="font-semibold text-blue-600 hover:text-blue-800 transition-colors text-sm block"
          >
            {email}
          </a>
        </div>
        <div>
          <span className="text-gray-500 block text-sm mb-1">Phone:</span>
          <a
            href={`tel:${phone}`}
            className="font-semibold text-green-600 hover:text-green-800 transition-colors text-sm block"
          >
            {phone}
          </a>
        </div>
      </div>
      <Counter />
    </div>
  );
};

export default ChaiCard;
