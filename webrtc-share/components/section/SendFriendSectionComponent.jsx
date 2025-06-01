import React from 'react'
import { Button } from '../ui/button'
import { Send } from 'lucide-react'

const SendFriendSectionComponent = () => {
    return (
        <section className='py-8 px-10'>
            <div className="mx-auto bg-amber-400  rounded-xl shadow-md p-8 relative overflow-hidden">


                <h3 className="text-2xl font-semibold mb-6 text-white">Send a link to a friend or co-worker</h3>

                <form onSubmit={() => { }} className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                        <input
                            type="text"
                            placeholder="From: Enter your name"
                            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white border-none`}

                        />
                    </div>

                    <div className="flex-1 w-full">
                        <input
                            type="text"
                            placeholder="Enter email for friend or co-worker..."
                            className={`w-full px-4 py-2  rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white border-none`}

                        ></input>
                    </div>

                    <div className="flex-1 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white border-none flex items-center">
                        <textarea
                            type="text"
                            placeholder="Enter your message..."
                            className={`w-full px-4 py-2 border-none outline-none flex-1 bg-white rounded-md`}
                        ></textarea>
                    </div>

                    <button  className={'bg-green-500 text-white rounded-md h-[auto] w-[auto] p-[0.30rem] mr-1 text-lg cursor-pointer flex items-center gap-1'}>
                        <span className='font-medium'>Send</span>
                        <img src='/icons/send-solid.svg' className='w-8 h-8'/>
                    </button>
                </form>
            </div>
        </section>
    )
}

export default SendFriendSectionComponent