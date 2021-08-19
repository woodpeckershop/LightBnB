select properties.id,title,start_date,cost_per_night, avg(rating)
from reservations join properties on property_id = properties.id 
join property_reviews on reservations.property_id = properties.id
where reservations.guest_id = 1 and end_date< now()::date
group by properties.id ,reservations.id
order by start_date
limit 10
