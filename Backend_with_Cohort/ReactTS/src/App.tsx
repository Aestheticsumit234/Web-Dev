import "./App.css";
import ChaiCard from "./components/ChaiCard";

function App() {
  const Data = [
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
    {
      name: "Chai",
      rolleNumber: "1",
      age: "22",
      isActive: true,
      gender: "male",
      email: "2G7Kt@example.com",
      phone: "1234567890",
      address: "123 Main St, Anytown, USA",
    },
  ];
  return (
    <div className="w-full ,min-h-screen bg-black pt-10">
      <h1 className="text-center text-white  text-3xl font-black mb-4">
        All tyes of chai
      </h1>
      <div className="w-full ,min-h-screen bg-black flex items-center justify-between flex-wrap ">
        {Data.map((data) => (
          <ChaiCard
            name={data.name}
            rolleNumber={data.rolleNumber}
            age={data.age}
            isActive={data.isActive}
            gender={data.gender}
            email={data.email}
            phone={data.phone}
            address={data.address}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
