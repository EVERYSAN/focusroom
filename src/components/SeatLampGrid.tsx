import type { Seat } from '../hooks/useSeatState'

interface Props {
  seats: Seat[]
}

export function SeatLampGrid({ seats }: Props) {
  return (
    <div className="seat-grid" aria-hidden="true">
      {seats.map((seat) => (
        <div
          key={seat.id}
          className={`seat-lamp seat-lamp--${seat.status}`}
        />
      ))}
    </div>
  )
}
