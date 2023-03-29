import { useState } from 'react';

const AddTaxi = ({mapRef}) => {
    
    const [circle, setCircle] = useState(null)
    const [count, setCount] = useState(0)

    const handleAddMarker = () => {
        // random latitude and longitude
        const bounds = mapRef.current.getBounds()
        const lat = Math.random() * (bounds.getNorth() - bounds.getSouth()) + bounds.getSouth()
        const lng = Math.random() * (bounds.getEast() - bounds.getWest()) + bounds.getWest()
        //random status
        const status = ["Free", "Booked", "On Break"]
        const randomStatus = status[Math.floor(Math.random() * status.length)]
        //random id
        const randomId = new Date().getTime().toString()

        const taxi = L.marker([lat, lng], {
            name: String.fromCharCode(65 + count),
            randomId,
            status: randomStatus,
        })

        // Popup
        setCircle(taxi)
        taxi.addTo(mapRef.current)
        taxi.bindPopup(`Id: ${randomId}, Name: ${String.fromCharCode(65 + count)}, Taxi Status: <b>${randomStatus}</b>, Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`).openPopup()
        setCount((count + 1) % 26)
    }

    return (
        <div>
            <button className='btn btn-info overlay-button-container' onClick={handleAddMarker}>Add Marker</button>
        </div>
    )
}

export default AddTaxi