select city, count (reservations)
from properties join reservations on property_id = properties.id
group by city
order by count (reservations) desc