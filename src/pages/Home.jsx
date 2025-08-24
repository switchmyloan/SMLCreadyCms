import React from 'react'


const Home = () => {
  return (
    <div>
      <div className="p-6 bg-gray-100 flex-1 overflow-auto">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard CMS</h1>
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                
              </div>
             
            </div>
            <p className="mt-4 text-lg">Count: </p>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
             
            >
              Increment
            </button>
          </div>
        </div>
    </div>
  )
}

export default Home
