CREATE OR REPLACE FUNCTION find_nearby_workers(
  lat float,
  lng float,
  radius_km float,
  min_rating float DEFAULT 0,
  req_skills text[] DEFAULT '{}'
)
RETURNS TABLE (
  id uuid,
  name varchar,
  skills text[],
  rating float,
  total_jobs int,
  availability boolean,
  profile_image text,
  is_active boolean,
  language language_type,
  distance_meters float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id, 
    w.name, 
    w.skills, 
    w.rating, 
    w.total_jobs, 
    w.availability, 
    w.profile_image, 
    w.is_active, 
    w.language,
    ST_Distance(w.location::geography, ST_MakePoint(lng, lat)::geography) as distance_meters
  FROM workers w
  WHERE w.availability = true 
    AND w.verification_status = 'APPROVED'
    AND w.is_active = true
    AND (min_rating = 0 OR w.rating >= min_rating)
    AND (array_length(req_skills, 1) IS NULL OR w.skills @> req_skills)
    AND ST_DWithin(w.location::geography, ST_MakePoint(lng, lat)::geography, radius_km * 1000);
END;
$$ LANGUAGE plpgsql;
