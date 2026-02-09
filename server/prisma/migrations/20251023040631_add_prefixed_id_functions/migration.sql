CREATE OR REPLACE FUNCTION pfx_id(prefix text)
RETURNS text
LANGUAGE plpgsql
PARALLEL SAFE
AS $$
DECLARE
    unix_time_ms CONSTANT bytea NOT NULL DEFAULT substring(int8send((extract(epoch FROM clock_timestamp()) * 1000)::bigint) from 3);
    buffer bytea := unix_time_ms;
    i int;
    random_byte int;
    uuid_value uuid;
BEGIN
    -- Generate 10 random bytes using built-in random()
	FOR i IN 1..10 LOOP
	    random_byte := floor(random() * 256)::int;
	    buffer := buffer || decode(lpad(to_hex(random_byte), 2, '0'), 'hex');
	END LOOP;

    RAISE NOTICE 'buffer length: %', length(buffer);  -- Should be 16

    -- Set UUID version to 7
    buffer := set_byte(buffer, 6, (b'0111' || get_byte(buffer, 6)::bit(4))::bit(8)::int);

    -- Set UUID variant to RFC 4122
    buffer := set_byte(buffer, 8, (b'10' || get_byte(buffer, 8)::bit(6))::bit(8)::int);

    uuid_value := encode(buffer, 'hex')::uuid;

    RETURN prefix || '_' || replace(uuid_value::text, '-', '');
END
$$;