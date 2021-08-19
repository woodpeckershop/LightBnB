select properties.id, title, cost_per_night,avg(rating)
from properties join property_reviews on property_id = properties.id
where city like '%ancouver'
group by properties.id

having avg(rating) >=4
order by cost_per_night
limit 10