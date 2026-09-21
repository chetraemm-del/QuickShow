import React, { useEffect, useState } from 'react'
import { dummyBookingData } from '../../assets/assets'
import Loading from '../../components/Loading'
import Title from '../../components/Admin/Title'
import { dateFormat } from '../../lib/dateFormat'
import { useAppContext } from '../../context/AppContext'

function ListBooking() {
  const {axios, getToken, user} = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY
  const [bookings, setBookings] = useState([])
  const [isloading, setIsloading] = useState(true)

  const getAllBookings = async () =>{
   try {
    const {data} = await axios.get('/api/admin/all-bookings', {headers : {Authorization : `Bearer ${await getToken()}`}})
    setBookings(data.bookings)
    setIsloading(false)
   } catch (error) {
    
   }
  }
  useEffect(()=>{
    getAllBookings()
  },[])
  return !isloading ? (
    <>
      <Title text1="List" text2="Bookings"/>
      <div className="max-w-4xl mt-6 overflow-x-auto">
  <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap">
    <thead>
      <tr className="bg-primary/20 text-left text-white">
        <th className="p-2 font-medium pl-5">User Name</th>
        <th className="p-2 font-medium">Movie Name</th>
        <th className="p-2 font-medium">Show Time</th>
        <th className="p-2 font-medium">Seats</th>
        <th className="p-2 font-medium">Amount</th>
      </tr>
    </thead>
    <tbody className='text-sm font-light'>
      {bookings.map((items, idx)=>(
        <tr key={idx} className="bg-primary/5 botder border-primary/10 text-left even:bg-primary/10">
        <td className="p-2 font-medium pl-5">{items.user.name}</td>
        <td className="p-2 font-medium">{items.show.movie.title}</td>
        <td className="p-2 font-medium">{dateFormat(items.show.showDateTime)}</td>
        <td className="p-2 font-medium">{Object.keys(items.bookedSeats).map(seat => items.bookedSeats[seat]).join(', ')}</td>
        <td className="p-2 font-medium">{currency} {items.amount}</td>
      </tr>
      ))}
    </tbody>
  </table>
</div>
    </>
  ):(
    <Loading/>
  )
}

export default ListBooking
