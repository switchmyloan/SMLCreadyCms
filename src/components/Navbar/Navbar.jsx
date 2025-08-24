// function Navbar() {
//   return (
//     <nav className="bg-blue-600 text-white p-4 shadow-md">
//       <div className="container mx-auto flex justify-between items-center">
//         <h1 className="text-2xl font-semibold">CMS Dashboard</h1>
//         <div>
//           <a href="#" className="mr-4 hover:text-gray-300">Login</a>
//           <a href="#" className="hover:text-gray-300">Signup</a>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md fixed w-full z-10">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-semibold">CMS Dashboard</h1>
        <div>
          <a href="#" className="mr-4 hover:text-gray-300">Login</a>
          <a href="#" className="hover:text-gray-300">Signup</a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;