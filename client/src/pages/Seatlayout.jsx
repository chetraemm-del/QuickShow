import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets, dummyDateTimeData, dummyShowsData } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

function Seatlayout() {
  const groupRow = [["A", "B"],["C", "D"],["E", "F"],["G", "H"],["I", "J"]]

  const {id, date} = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const navigate = useNavigate()

  const {axios, getToken, user} = useAppContext()

  const getShow = async () => {
    try {
      const {data} = await axios.get(`/api/show/${id}`)
      if (data.success) {
        setShow(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSeatClick = (seatId) => {
    if (!selectedTime) {
      return toast.error("Please select time first")
    }
    if (!selectedSeats.includes(seatId) && selectedSeats.length > 4) {
      return toast.error("You can only select 5 seats")
    }
    if (occupiedSeats.includes(seatId)) {
      return toast.error("This seat is already booked")
    }
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev, seatId])
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-1.5 mt-1.5">
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;

          return (
            <button
              type="button"
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`h-7 w-7 md:h-8 md:w-8 text-[10px] rounded border border-primary/60 cursor-pointer ${
                selectedSeats.includes(seatId) ? "bg-primary text-white" : ""
              } ${occupiedSeats.includes(seatId) ? "opacity-50" : ""}`}
            >
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  )

  const getOccupiedSeats = async () => {
    try {
      const {data} = await axios.get(`/api/booking/seats/${selectedTime.showId}`)
      if (data.success) {
        setOccupiedSeats(data.data ?? [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const bookTickets = async () => {
    try {
      if (!user) return toast.error('Please login to proceed')
      if (!selectedTime || !selectedSeats.length) return toast.error('Please select a time and seats')

      const {data} = await axios.post('/api/booking/create', {showId: selectedTime.showId, selectedSeats}, {headers : {Authorization: `Bearer ${await getToken()}`}})
      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    getShow()
  }, [id])

  useEffect(() => {
    setSelectedSeats([])
    setOccupiedSeats([])
    if (selectedTime) {
      getOccupiedSeats()
    }
  }, [selectedTime])

  const availableTimes = show?.dateTime?.[date] ?? []

  return show ? (
    <div className='flex flex-col md:flex-row px-4 md:px-10 lg:px-24 py-20 md:pt-40'>
      <div className='w-52 bg-primary/10 border border-primary/20 rounded-lg py-6 h-max md:sticky md:top-28'>
        <p className='text-base font-semibold px-4'>Available Timings</p>
        <div className='mt-4 space-y-1'>
          {availableTimes.map((item) => (
            <button
              type='button'
              key={item.time}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-4 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? "bg-primary text-white " : "hover:bg-primary/20"}`}
            >
              <ClockIcon className='w-4 h-4'/>
              <p className='text-xs'>{isoTimeFormat(item.time)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className='relative flex-1 flex flex-col items-center max-md:mt-12'>
        <BlurCircle top='-100px' left='-100px'/>
        <BlurCircle bottom='0px' right='0px'/>
        <h1 className='text-xl font-semibold mb-3'>Select your seat</h1>
        <img src={assets.screenImage} alt="" className='w-72 md:w-80' />
        <p className='text-gray-400 text-[10px] mb-4'>SCREEN SIDE</p>
        <div className='flex flex-col items-center mt-6 text-[10px] text-gray-300'>
          <div className='grid grid-cols-2 md:grid-cols-1 gap-1 md:gap-1 mb-4'>
            {groupRow[0].map(row => renderSeats(row))}
          </div>
        </div>
        <div className='text-[10px] grid grid-cols-2 gap-8'>
          {groupRow.slice(1).map((group, idx) => (
            <div key={idx}>
              {group.map(row => renderSeats(row))}
            </div>
          ))}
        </div>
        <button onClick={bookTickets} className='flex items-center gap-1 mt-12 px-8 py-2.5 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95'>
          Proceed to Checkout
          <ArrowRightIcon strokeWidth={3} className='w-4 h-4'/>
        </button>
      </div>
    </div>
  ) : (
    <Loading/>
  )
}

export default Seatlayout
