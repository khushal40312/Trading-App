import React from 'react'




const BuySellPanel = React.memo(({ selectedSide, setSelectedSide }) => {

    const handleSideClick = (side) => {
        setSelectedSide(side);
    };



    
    return (
        <div  className="w-[50vw] h-[70vh] bg-black py-6">
            <div className="flex justify-center gap-2 mt-2">
                {['buy', 'sell'].map((side) => (
                    <button
                        key={side}
                        onClick={() => handleSideClick(side)}
                        className={`border border-2 px-5 py-2 rounded-xl font-bold text-white ${selectedSide === side ? `bg-${side === 'buy' ? 'green' : 'red'}-500 border-white-500` : 'bg-black border-white'
                            }`}
                    >
                        {side.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="flex flex-col items-center gap-8 mt-6">
                <button className="w-40 rounded-xl text-white bg-[#413f3f]">Market</button>
                <div className="flex flex-col items-center">
                    <select className="text-white rounded mb-1">
                        <option>USDT (Total)</option>
                    </select>
                    <input className="h-10 w-43 rounded text-white bg-[#413f3f]" type="number" />
                </div>
                <button
                    className={`${selectedSide === 'buy' ? 'bg-green-600' : 'bg-red-600'
                        } text-xl font-bold text-white rounded-2xl w-40 px-6 py-6`}
                >
                    {selectedSide.toUpperCase()}
                </button>
            </div>
        </div>
    )
});


export default BuySellPanel
