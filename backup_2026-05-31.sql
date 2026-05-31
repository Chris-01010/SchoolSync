--
-- PostgreSQL database dump
--

\restrict 8iSgCyZSetiB1Ua5OSCs603ylmEgKnC1kyouWe2em6T4mEmVM2T6fLI9whk7sR9

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: absencestatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.absencestatus AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'CLARIFICATION_REQUESTED'
);


ALTER TYPE public.absencestatus OWNER TO postgres;

--
-- Name: assignmentmode; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.assignmentmode AS ENUM (
    'SWAP',
    'CONSUME'
);


ALTER TYPE public.assignmentmode OWNER TO postgres;

--
-- Name: notificationtype; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notificationtype AS ENUM (
    'LEAVE_REQUEST',
    'LEAVE_APPROVED',
    'LEAVE_REJECTED',
    'RELIEF_REQUEST',
    'RELIEF_ACCEPTED',
    'RELIEF_REJECTED',
    'ANNOUNCEMENT',
    'GENERAL'
);


ALTER TYPE public.notificationtype OWNER TO postgres;

--
-- Name: reliefstatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.reliefstatus AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED',
    'FLAGGED',
    'OVERRIDDEN',
    'AWAITING_CONFIRMATION'
);


ALTER TYPE public.reliefstatus OWNER TO postgres;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.userrole AS ENUM (
    'ADMIN',
    'HOD',
    'TEACHER'
);


ALTER TYPE public.userrole OWNER TO postgres;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
begin
    if not exists (
        select 1
        from pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_
        -- Filter by action early - only get subscriptions interested in this action
        -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
        and (subs.action_filter = '*' or subs.action_filter = action::text);

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL AND ppt.tablename NOT LIKE '% %'),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  -- Count raw slot entries before apply_rls/subscription filter
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  -- Apply RLS and filter as before
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  -- Real rows with slot count attached
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  -- Sentinel row: always returned when no real rows exist so Elixir can
  -- always read slot_changes_count. Identified by wal IS NULL.
  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach (unchanged)
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT path_tokens[$1] AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $2 || '%%'
                  AND bucket_id = $3
                  AND array_length(objects.path_tokens, 1) <> $1
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT path_tokens[$1] AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $2 || '%%'
               AND bucket_id = $3
               AND array_length(objects.path_tokens, 1) = $1
             ORDER BY %I %s)
            LIMIT $4 OFFSET $5
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := split_part(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter), v_delimiter, levels);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := split_part(v_current.name, v_delimiter, levels);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    IF p_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        p_sort_column,
        v_cursor_op,
        p_sort_column,
        p_sort_order,
        p_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: absences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.absences (
    id uuid NOT NULL,
    teacher_id uuid,
    date date NOT NULL,
    period_start smallint,
    period_end smallint,
    leave_type character varying,
    reason character varying,
    handover_url character varying,
    status public.absencestatus NOT NULL,
    resolved boolean,
    resolution_report_url character varying,
    clarification_note character varying,
    is_emergency boolean DEFAULT false,
    emergency_submitted_at timestamp with time zone,
    hod_response_deadline timestamp with time zone,
    auto_approved boolean DEFAULT false
);


ALTER TABLE public.absences OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid NOT NULL,
    performed_by_user_id uuid,
    performed_by_college_id character varying,
    action character varying NOT NULL,
    target_college_id character varying,
    details json,
    "timestamp" timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: blocked_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocked_slots (
    id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    day character varying NOT NULL,
    period integer NOT NULL,
    reason character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.blocked_slots OWNER TO postgres;

--
-- Name: classes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.classes (
    id uuid NOT NULL,
    name character varying NOT NULL,
    grade integer,
    section character varying,
    academic_year character varying
);


ALTER TABLE public.classes OWNER TO postgres;

--
-- Name: department_subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.department_subjects (
    id uuid NOT NULL,
    department_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    department_name character varying,
    subject_name character varying
);


ALTER TABLE public.department_subjects OWNER TO postgres;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id uuid NOT NULL,
    name character varying NOT NULL,
    hod_id uuid
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    user_id uuid,
    title character varying NOT NULL,
    content text NOT NULL,
    is_read boolean,
    created_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone,
    action_url character varying,
    notification_type public.notificationtype DEFAULT 'GENERAL'::public.notificationtype
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: relief_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.relief_assignments (
    id uuid NOT NULL,
    absence_id uuid,
    relief_teacher_id uuid,
    slot_id uuid,
    score integer,
    status public.reliefstatus NOT NULL,
    reason_text character varying,
    flag_reason character varying,
    assigned_at timestamp with time zone DEFAULT now(),
    acknowledged_at timestamp with time zone,
    assignment_mode public.assignmentmode,
    swapped_slot_id uuid,
    consume_substitute_confirmed boolean,
    consume_absent_confirmed boolean,
    is_emergency boolean DEFAULT false,
    response_deadline timestamp with time zone,
    deadline_at timestamp with time zone,
    rank_index integer,
    ranked_pool text
);


ALTER TABLE public.relief_assignments OWNER TO postgres;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    id uuid NOT NULL,
    name character varying NOT NULL,
    capacity integer,
    room_type character varying
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- Name: subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subjects (
    id uuid NOT NULL,
    name character varying NOT NULL,
    department_id uuid
);


ALTER TABLE public.subjects OWNER TO postgres;

--
-- Name: teacher_leave_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_leave_balances (
    id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    academic_year character varying(9) NOT NULL,
    balance double precision NOT NULL,
    used_ytd double precision NOT NULL,
    carry_over double precision NOT NULL,
    last_credited_month integer,
    last_updated timestamp with time zone DEFAULT now()
);


ALTER TABLE public.teacher_leave_balances OWNER TO postgres;

--
-- Name: teacher_subjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_subjects (
    id uuid NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    teacher_name character varying,
    subject_name character varying,
    department_name character varying
);


ALTER TABLE public.teacher_subjects OWNER TO postgres;

--
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    id uuid NOT NULL,
    user_id uuid,
    name character varying NOT NULL,
    email character varying NOT NULL,
    department_id uuid,
    weekly_relief_cap integer,
    max_weekly_hours integer,
    current_relief_hours integer,
    total_hours_worked integer,
    is_active boolean,
    blocked_slots json
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- Name: timetable_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetable_slots (
    id uuid NOT NULL,
    timetable_version_id uuid,
    teacher_id uuid,
    class_id uuid,
    room_id uuid,
    subject_id uuid,
    day_of_week smallint,
    period smallint,
    start_time time without time zone,
    end_time time without time zone,
    is_relief boolean,
    original_teacher_id uuid
);


ALTER TABLE public.timetable_slots OWNER TO postgres;

--
-- Name: timetable_versions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetable_versions (
    id uuid NOT NULL,
    school_id uuid,
    published_by uuid,
    published_at timestamp with time zone DEFAULT now(),
    is_active boolean,
    data_snapshot json NOT NULL
);


ALTER TABLE public.timetable_versions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    college_id character varying NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    role public.userrole NOT NULL,
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    refresh_token character varying,
    refresh_token_expires_at timestamp with time zone,
    is_verified boolean,
    verification_token character varying,
    verification_token_expires_at timestamp with time zone,
    reset_token character varying,
    reset_token_expires_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: absences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.absences (id, teacher_id, date, period_start, period_end, leave_type, reason, handover_url, status, resolved, resolution_report_url, clarification_note, is_emergency, emergency_submitted_at, hod_response_deadline, auto_approved) FROM stdin;
480f0e06-4ae2-4687-84d0-e7b47fe87fe1	ba06d626-704c-409c-b8aa-71a5bc198ad2	2026-06-03	4	6	Personal Leave	Urgent matter	\N	PENDING	f	\N	\N	f	\N	\N	f
3638eca5-12f9-40a5-9959-36ae9d15d9b4	6bfd0788-e3db-4152-bccf-f55106aa245a	2026-06-04	1	6	Casual Leave	Family function	\N	APPROVED	f	\N	\N	f	\N	\N	f
e774e437-d663-4896-950e-ba2c96605526	952c74d9-b273-4754-aba6-bc34fb9701ec	2026-06-05	1	6	Earned Leave	Annual vacation	\N	APPROVED	f	\N	\N	f	\N	\N	f
6782f1cf-8e97-4bc5-a085-c478375a3d45	f9ab054b-5044-4d1f-adb2-1fd55b21654d	2026-05-26	3	5	Sick Leave	Migraine	\N	APPROVED	t	\N	\N	f	\N	\N	f
3f4d4bc4-2203-44ac-97f8-19ff71f3ce3e	20ed771d-daec-425e-b0eb-98f72b2859d6	2026-05-26	1	3	Sick Leave	Flu	\N	APPROVED	t	\N	\N	f	\N	\N	f
a94190bf-8860-4b68-bb27-ea892d3e46d3	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	2026-06-05	1	2	Personal Leave	Bank appointment	\N	REJECTED	f	\N	\N	f	\N	\N	f
f3144eee-0270-4f00-9a67-4f6aace035fb	4881abb1-a300-4491-b821-2425a5fe6fce	2026-06-01	1	3	Sick Leave	Fever	\N	APPROVED	f	\N	\N	f	\N	\N	f
0977678e-e86e-4cfc-b879-23a80a7b15c3	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	2026-06-02	1	6	Casual Leave	Wedding	\N	APPROVED	f	\N	\N	f	\N	\N	f
f6d5cf78-54e0-47a8-accb-904ed9d4f9d6	f9ab054b-5044-4d1f-adb2-1fd55b21654d	2026-06-03	1	8	sick	fewasd	\N	PENDING	f	\N	\N	f	\N	\N	f
3edadad5-d5a6-4438-9595-b05789d03895	f9ab054b-5044-4d1f-adb2-1fd55b21654d	2026-05-31	1	8	sick	No reason provided	\N	PENDING	f	\N	\N	f	\N	\N	f
35112b33-1f88-4496-9a57-62d3f9612cca	f9ab054b-5044-4d1f-adb2-1fd55b21654d	2026-05-31	1	8	sick	No reason provided	\N	PENDING	f	\N	\N	f	\N	\N	f
893f47f2-eb35-4897-9b28-b130254f8da0	f9ab054b-5044-4d1f-adb2-1fd55b21654d	2026-05-31	1	8	sick	No reason provided	\N	PENDING	f	\N	\N	f	\N	\N	f
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, performed_by_user_id, performed_by_college_id, action, target_college_id, details, "timestamp") FROM stdin;
\.


--
-- Data for Name: blocked_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocked_slots (id, teacher_id, day, period, reason, created_at) FROM stdin;
\.


--
-- Data for Name: classes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.classes (id, name, grade, section, academic_year) FROM stdin;
224026d8-9ea6-4e3a-8183-923e8d6e8709	CS S3-A	3	A	2025-2026
221a5345-1279-484f-a936-c68685a50518	CS S3-B	3	B	2025-2026
b40d6ef6-98b6-4306-be74-a9e9dd15e432	CS S5-A	5	A	2025-2026
2272e738-3976-40d9-afee-3bd85a03caa8	AD S3-A	3	A	2025-2026
9adba716-7432-495a-ad2f-1b59f9263e7c	AD S5-A	5	A	2025-2026
52ceb9dc-0d7a-4309-bee4-f201ea634c76	IT S3-A	3	A	2025-2026
8f6e9d95-f6e6-493d-859f-58aad0df47af	IT S5-A	5	A	2025-2026
77aa3961-cda0-4580-b436-0098ac09239c	EC S3-A	3	A	2025-2026
205c8e11-2a8f-4477-971b-1146564b9a6c	MECH S5-A	5	A	2025-2026
bae28b43-93ff-466d-9a4b-5ca69badee99	EEE S3-A	3	A	2025-2026
\.


--
-- Data for Name: department_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.department_subjects (id, department_id, subject_id, created_at, department_name, subject_name) FROM stdin;
5c28c028-5dfb-4510-939d-a118b6aed9b4	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 10:02:50.913054+00	CS	computer structures
9d0477cd-6bb2-4449-afbf-cded61a0b704	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 10:02:50.913054+00	CS	mse
2a408b23-741f-4198-844f-ea2e81b48d7e	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 10:02:50.913054+00	CS	operating systems
dccf8558-5089-41f5-8d50-025f49d46e86	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 10:02:50.913054+00	CS	Python
4682dbc1-9685-4781-8b04-992fe7427812	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 10:02:50.913054+00	CS	COI
f8595200-35c1-470f-8c83-70f9efc196fa	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 10:02:50.913054+00	CS	communication for engineers
5cec743e-38c7-4836-b53c-ec4740482aae	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 10:02:50.913054+00	CS	dbms
091f6377-b877-4801-9266-1a99efa5e191	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 10:02:50.913054+00	CS	math
d57239e6-a012-4078-a663-83c122c929b9	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 10:02:50.913054+00	CS	C
11a34ecc-19e6-44ce-a149-a5212ba4bfa6	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 10:02:50.913054+00	CS	object-oriented techniques
7c8f3bc7-861e-4215-b9a8-d2ce03aaecc6	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 10:02:50.913054+00	CS	minor/honors
083eee2d-c5fb-40df-9663-dfc17e784fb6	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 10:02:50.913054+00	CS	data structures
a79c3dce-8a1d-4f1d-83c4-e0e6bca979fa	9098976e-7944-4113-a90f-ce8b3b053eef	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 10:02:50.913054+00	IT	computer structures
d0ec6c2e-5be8-4a01-971d-07135b459857	9098976e-7944-4113-a90f-ce8b3b053eef	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 10:02:50.913054+00	IT	mse
dad3d8fd-b229-40e5-aed5-c5f85e4c1b0c	9098976e-7944-4113-a90f-ce8b3b053eef	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 10:02:50.913054+00	IT	operating systems
de235ab6-d624-4c89-81ae-975f9ea0738e	9098976e-7944-4113-a90f-ce8b3b053eef	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 10:02:50.913054+00	IT	Python
cd02104e-7d7a-439a-88bd-a6856f934b4b	9098976e-7944-4113-a90f-ce8b3b053eef	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 10:02:50.913054+00	IT	COI
e9e77a16-fb58-42a3-87a7-faaea08f43bb	9098976e-7944-4113-a90f-ce8b3b053eef	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 10:02:50.913054+00	IT	communication for engineers
dbfcc688-64fc-4539-80a4-9fd618b92b73	9098976e-7944-4113-a90f-ce8b3b053eef	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 10:02:50.913054+00	IT	dbms
1536a0ed-7705-4bae-b5cb-25806692a72f	9098976e-7944-4113-a90f-ce8b3b053eef	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 10:02:50.913054+00	IT	math
bc320eb3-6bc0-4c7d-914d-cac934455a20	9098976e-7944-4113-a90f-ce8b3b053eef	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 10:02:50.913054+00	IT	C
d409a024-0d19-48d0-a5b1-035bb35d0c10	9098976e-7944-4113-a90f-ce8b3b053eef	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 10:02:50.913054+00	IT	object-oriented techniques
53aa2c35-e327-4922-807d-6cf631620a36	9098976e-7944-4113-a90f-ce8b3b053eef	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 10:02:50.913054+00	IT	minor/honors
a60ee4d6-397a-40cd-8600-b63bbf7caaf3	9098976e-7944-4113-a90f-ce8b3b053eef	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 10:02:50.913054+00	IT	data structures
16c58201-910a-4ad1-bb84-ca3e7866def9	09d5a90b-b697-4240-9b42-e52fff482071	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 10:02:50.913054+00	EC	computer structures
a4d7de6d-f300-40a9-b1da-62d730a403b2	09d5a90b-b697-4240-9b42-e52fff482071	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 10:02:50.913054+00	EC	mse
fe89df56-ac75-4813-8cb5-26f15b014865	09d5a90b-b697-4240-9b42-e52fff482071	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 10:02:50.913054+00	EC	operating systems
93673243-079e-42bd-b85b-84953ba73574	09d5a90b-b697-4240-9b42-e52fff482071	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 10:02:50.913054+00	EC	Python
ad68a37f-6b80-43a6-8af4-2f6d80c63590	09d5a90b-b697-4240-9b42-e52fff482071	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 10:02:50.913054+00	EC	COI
05718160-fca2-463a-a713-bdba413a205a	09d5a90b-b697-4240-9b42-e52fff482071	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 10:02:50.913054+00	EC	communication for engineers
f2c9acf9-5469-420c-9e72-2e122c8bc93b	09d5a90b-b697-4240-9b42-e52fff482071	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 10:02:50.913054+00	EC	dbms
dd8a64f0-08d4-468e-909b-ad2a673a1300	09d5a90b-b697-4240-9b42-e52fff482071	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 10:02:50.913054+00	EC	math
9b3908ae-2b72-418b-be74-9f1cea4d6365	09d5a90b-b697-4240-9b42-e52fff482071	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 10:02:50.913054+00	EC	C
b31a28eb-d90a-4bc9-b175-35466e234e42	09d5a90b-b697-4240-9b42-e52fff482071	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 10:02:50.913054+00	EC	object-oriented techniques
71396439-77b1-4e7b-861f-e8dfdf84d449	09d5a90b-b697-4240-9b42-e52fff482071	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 10:02:50.913054+00	EC	minor/honors
b4eb4872-406a-4d6d-854d-a27b61c84a67	09d5a90b-b697-4240-9b42-e52fff482071	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 10:02:50.913054+00	EC	data structures
bb09e039-2c80-440b-88f0-28e06b77d1a6	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 10:02:50.913054+00	MECH	computer structures
3b48261d-35d9-476e-bc09-9d1f445dd2a5	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 10:02:50.913054+00	MECH	mse
d9df576d-9e27-4aa0-9fca-6b2ee9d2da44	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 10:02:50.913054+00	MECH	operating systems
ca063f42-11d3-47ed-85b1-3cd5e7a4f324	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 10:02:50.913054+00	MECH	Python
e64d7efb-7e53-4d70-9abc-300066dc2f20	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 10:02:50.913054+00	MECH	communication for engineers
1dc32893-65a8-4291-8abb-e08fb12923e3	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 10:02:50.913054+00	MECH	dbms
b41ff7e2-bc12-4162-837d-fd748bf1e784	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 10:02:50.913054+00	MECH	math
63156fc0-5fae-413c-92d0-a552b8ba985b	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 10:02:50.913054+00	MECH	object-oriented techniques
648924d2-335c-4e81-afbd-b64b9fcd39b4	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 10:02:50.913054+00	MECH	minor/honors
f13e77a2-9706-4bde-b152-cab2a7f22791	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 10:02:50.913054+00	MECH	data structures
98dd7b02-a75c-41b0-b193-e14a9837d65f	681341d4-a7c1-402b-9664-2f388387acfa	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 10:02:50.913054+00	AD	computer structures
c36ee505-fd6e-46f3-8f26-7ebb5dbf51c0	681341d4-a7c1-402b-9664-2f388387acfa	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 10:02:50.913054+00	AD	mse
75f425f4-5fb8-401d-a22a-2e591a7bacae	681341d4-a7c1-402b-9664-2f388387acfa	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 10:02:50.913054+00	AD	Python
9c9c5297-8761-44b5-937e-29d4d1ea4dbe	681341d4-a7c1-402b-9664-2f388387acfa	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 10:02:50.913054+00	AD	communication for engineers
9c8b18b8-6660-47c9-a32c-91d44bb65c73	681341d4-a7c1-402b-9664-2f388387acfa	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 10:02:50.913054+00	AD	dbms
781ef6aa-6dae-4b12-b1fe-1b0469a89480	681341d4-a7c1-402b-9664-2f388387acfa	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 10:02:50.913054+00	AD	math
5dbac596-f38c-4647-9c13-592d4c7014ce	681341d4-a7c1-402b-9664-2f388387acfa	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 10:02:50.913054+00	AD	object-oriented techniques
f4e7b9bd-bc2e-4203-bf44-f9a2c0178f0b	681341d4-a7c1-402b-9664-2f388387acfa	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 10:02:50.913054+00	AD	minor/honors
efe27e5e-dc26-404e-9e95-8e3808bc907c	681341d4-a7c1-402b-9664-2f388387acfa	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 10:02:50.913054+00	AD	data structures
9bf5dbf1-6604-4ea9-89cb-53eda7c96ebc	869d233b-981a-475c-8646-dc511ada08f9	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 10:02:50.913054+00	EEE	mse
d88e5517-63d5-4370-8831-e4355442bd2c	869d233b-981a-475c-8646-dc511ada08f9	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 10:02:50.913054+00	EEE	Python
a8a19550-82dc-4280-aa66-02373ab93341	869d233b-981a-475c-8646-dc511ada08f9	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 10:02:50.913054+00	EEE	COI
e0db1908-5489-40f6-8724-7f96eafe7930	869d233b-981a-475c-8646-dc511ada08f9	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 10:02:50.913054+00	EEE	communication for engineers
dc8f7fc9-4df9-472b-8014-c1795829ae9f	869d233b-981a-475c-8646-dc511ada08f9	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 10:02:50.913054+00	EEE	dbms
3fd6c38b-e693-4458-869e-17d39da61a86	869d233b-981a-475c-8646-dc511ada08f9	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 10:02:50.913054+00	EEE	math
ea5bfdad-bbe6-46f0-8e70-45a7ef6f7dfd	869d233b-981a-475c-8646-dc511ada08f9	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 10:02:50.913054+00	EEE	object-oriented techniques
6378844e-bed2-44e5-a012-13f2c55f3a01	869d233b-981a-475c-8646-dc511ada08f9	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 10:02:50.913054+00	EEE	minor/honors
25408f8a-ec05-4f67-91ca-1d1dbc28e506	869d233b-981a-475c-8646-dc511ada08f9	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 10:02:50.913054+00	EEE	data structures
0a1b995e-c1ca-4816-b175-476066fae70d	92c07f66-8e30-4185-879e-ea05e7c404e4	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 10:02:50.913054+00	CIVIL	mse
2a988429-6b99-48ce-b434-7140afebcaa7	92c07f66-8e30-4185-879e-ea05e7c404e4	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 10:02:50.913054+00	CIVIL	operating systems
5dd0efe9-fa2e-41a5-92b7-2c5970256571	92c07f66-8e30-4185-879e-ea05e7c404e4	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 10:02:50.913054+00	CIVIL	Python
3504499a-7fa0-4876-8d55-c3085e7578b0	92c07f66-8e30-4185-879e-ea05e7c404e4	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 10:02:50.913054+00	CIVIL	COI
cfb42224-ea2e-4e5d-9ec6-9565a64620b5	92c07f66-8e30-4185-879e-ea05e7c404e4	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 10:02:50.913054+00	CIVIL	communication for engineers
6816442f-e9ad-49cb-a1f7-cb7c96f10fd4	92c07f66-8e30-4185-879e-ea05e7c404e4	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 10:02:50.913054+00	CIVIL	math
8aec8490-fa51-45c3-b33b-a52d0b5fdf4e	92c07f66-8e30-4185-879e-ea05e7c404e4	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 10:02:50.913054+00	CIVIL	C
882fec67-df55-4b09-a0ad-8cc54b429e5c	92c07f66-8e30-4185-879e-ea05e7c404e4	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 10:02:50.913054+00	CIVIL	minor/honors
644ee260-0586-48b3-a0cc-96ad42185ea5	92c07f66-8e30-4185-879e-ea05e7c404e4	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 10:02:50.913054+00	CIVIL	data structures
6e2726be-2f33-4688-bf7e-1c0064b20efe	1da0f888-eab8-43f7-9124-f4506ea82235	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 10:02:50.913054+00	AEI	computer structures
9f9f75bd-1768-4faf-9310-6ef92ccff2b8	1da0f888-eab8-43f7-9124-f4506ea82235	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 10:02:50.913054+00	AEI	mse
ea3cb3e4-9ffc-4101-9c97-6547e7c44cea	1da0f888-eab8-43f7-9124-f4506ea82235	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 10:02:50.913054+00	AEI	Python
ac3183c0-c366-4529-b376-0e8ced8a9dce	1da0f888-eab8-43f7-9124-f4506ea82235	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 10:02:50.913054+00	AEI	communication for engineers
b26a013b-adcb-4241-a856-20b78fa4eab1	1da0f888-eab8-43f7-9124-f4506ea82235	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 10:02:50.913054+00	AEI	math
c35ac3c8-842b-4a6b-ab2f-7e67542ece52	1da0f888-eab8-43f7-9124-f4506ea82235	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 10:02:50.913054+00	AEI	minor/honors
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, name, hod_id) FROM stdin;
d585b4d5-a4a1-4dc3-aa86-5d540b19af42	MECH	00237f14-5738-4532-859c-32a61bb899cc
1da0f888-eab8-43f7-9124-f4506ea82235	AEI	5fa0c723-8c64-42ab-9e66-ebe706f0b54b
92c07f66-8e30-4185-879e-ea05e7c404e4	CIVIL	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d
869d233b-981a-475c-8646-dc511ada08f9	EEE	96392161-3983-49a7-9a11-1136da7ba255
71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	CS	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641
681341d4-a7c1-402b-9664-2f388387acfa	AD	c0bf301a-4f36-4c0a-8983-5de3cf08eff7
9098976e-7944-4113-a90f-ce8b3b053eef	IT	d6ce58a8-9f9b-4d89-96ec-2541719f5032
09d5a90b-b697-4240-9b42-e52fff482071	EC	bc3065dc-25e0-4370-8787-73a70187b735
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, content, is_read, created_at, read_at, action_url, notification_type) FROM stdin;
52100399-ad98-4957-917d-c97a677392cf	fa81cfec-48c8-48c1-aae4-6afd7e754738	Relief assignment confirmed	You have been assigned to cover P3 CS S5-A on Tuesday.	f	2026-05-30 18:38:58.35359+00	\N	\N	GENERAL
a6f6792e-a0a4-4505-85d6-e81fa351aa9b	fa81cfec-48c8-48c1-aae4-6afd7e754738	Leave application approved	Your sick leave has been approved.	f	2026-05-30 18:38:58.35359+00	\N	\N	GENERAL
89abbe75-77b2-43dd-8d73-9a0ed536d1de	59f338d8-c321-4163-84fd-8dfd70a030b6	Relief request pending	You have a pending relief assignment.	f	2026-05-30 18:38:58.35359+00	\N	\N	GENERAL
700336a8-49e5-4307-9d00-f5c2d86ec364	c20d0ab1-b998-43a8-9cc0-795b91965e26	New leave application	Priya Menon submitted a leave request.	f	2026-05-30 18:38:58.35359+00	\N	\N	GENERAL
7c5081a3-c707-473f-ba16-06f9ffc75159	c20d0ab1-b998-43a8-9cc0-795b91965e26	New leave application	Ravi Iyer submitted a casual leave request.	f	2026-05-30 18:38:58.35359+00	\N	\N	GENERAL
0da47eee-066b-43d5-8521-984a9ad2daa2	f9966766-17b9-4475-9d52-4457d9a78c6f	Timetable published	The 2025-2026 timetable is now active.	f	2026-05-30 18:38:58.35359+00	\N	\N	GENERAL
1a25e443-18c3-4bd8-8489-b3269617d29a	59f338d8-c321-4163-84fd-8dfd70a030b6	Leave Request Approved	Your Sick Leave leave on 2026-06-01 has been approved.	f	2026-05-31 03:37:16.449982+00	\N	/dashboard/leaves	LEAVE_APPROVED
1d66fc8c-a08b-4774-a07f-beab9c9bd158	f9966766-17b9-4475-9d52-4457d9a78c6f	Leave Request Approved	Priya Menon's leave on 2026-06-01 was APPROVED by HOD Dr. Anita Sharma.	f	2026-05-31 03:37:20.631938+00	\N	/admin/leave-monitoring?leave_id=f3144eee-0270-4f00-9a67-4f6aace035fb	LEAVE_APPROVED
fdb2b0c4-56a5-42df-a719-218415b69534	134dcab9-0f4a-4f82-bd81-4b236cd41f8b	Leave Request Approved	Your Casual Leave leave on 2026-06-02 has been approved.	f	2026-05-31 03:54:11.403548+00	\N	/dashboard/leaves	LEAVE_APPROVED
555035a5-ef9e-4ddf-b706-313645c9f1d5	f9966766-17b9-4475-9d52-4457d9a78c6f	Leave Request Approved	Ravi Iyer's leave on 2026-06-02 was APPROVED by HOD Dr. Anita Sharma.	f	2026-05-31 03:54:15.547737+00	\N	/admin/leave-monitoring?leave_id=0977678e-e86e-4cfc-b879-23a80a7b15c3	LEAVE_APPROVED
\.


--
-- Data for Name: relief_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.relief_assignments (id, absence_id, relief_teacher_id, slot_id, score, status, reason_text, flag_reason, assigned_at, acknowledged_at, assignment_mode, swapped_slot_id, consume_substitute_confirmed, consume_absent_confirmed, is_emergency, response_deadline, deadline_at, rank_index, ranked_pool) FROM stdin;
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (id, name, capacity, room_type) FROM stdin;
8014f294-0b51-4db3-ac8c-ef5d83c191e2	Room 101	60	Lecture Hall
7a47f680-150c-46c6-9872-ef797438f56d	Room 102	60	Lecture Hall
b3452cdd-0a4a-449b-aaa7-a39955d71fd6	Room 201	60	Lecture Hall
a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	Room 202	60	Lecture Hall
76e45a9e-3440-4fe4-add0-ec7d313a475b	Room 301	60	Lecture Hall
c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	CS Lab 1	40	Computer Lab
fbe17642-98ac-4ac9-8480-dd5fd62e85a5	CS Lab 2	40	Computer Lab
cbb37705-50ad-40a2-8a04-1938036cd5ee	Electronics Lab	35	Electronics Lab
270d357c-837a-43b5-9112-95f3273ca5d9	Mechanics Lab	30	Mechanical Lab
95f682d6-631b-475a-b641-f368f24e6c33	Seminar Hall	120	Auditorium
67098572-67c7-483a-b635-4e57535c51f1	Room 11	40	classroom
ad5db457-1731-4a27-8ba9-98ce1fa8c68f	Room 12	40	classroom
d6354847-3e02-41c7-b8fd-d11e3253ce4e	Room 13	40	classroom
f2c38d76-e3c2-40f9-8b87-f609c73b4e89	Room 14	40	classroom
\.


--
-- Data for Name: subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subjects (id, name, department_id) FROM stdin;
e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	math	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65
ff609222-11e0-46cc-a0fb-93c8efe3ab69	data structures	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65
2215053e-c7e9-4d6d-a098-0a5955c3e7ce	computer structures	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65
83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	communication for engineers	9098976e-7944-4113-a90f-ce8b3b053eef
f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	object-oriented techniques	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65
e02a0a13-6e16-4a07-beab-2c2f31882d73	dbms	9098976e-7944-4113-a90f-ce8b3b053eef
23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	mse	d585b4d5-a4a1-4dc3-aa86-5d540b19af42
fb42081d-2f58-480e-8bb9-16ad9e2a8704	minor/honors	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65
5f11e583-cebc-4eb3-b9df-8a18887fdb80	operating systems	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65
79071461-9063-43ef-91f5-c2718a6fd1c5	COI	92c07f66-8e30-4185-879e-ea05e7c404e4
657be3d8-3910-4e25-a30d-db0b6f61551d	Python	681341d4-a7c1-402b-9664-2f388387acfa
f4d0cb93-a3f4-46c1-9794-0a33af1212ef	C	9098976e-7944-4113-a90f-ce8b3b053eef
\.


--
-- Data for Name: teacher_leave_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_leave_balances (id, teacher_id, academic_year, balance, used_ytd, carry_over, last_credited_month, last_updated) FROM stdin;
1d812c32-fc16-42ba-9072-ad27473d08fb	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
b74c5078-40ee-43d7-900a-e0e407b90a01	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
74612a31-2719-41eb-8763-1473667261c7	d6ce58a8-9f9b-4d89-96ec-2541719f5032	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
f2be0cd8-a5bf-4093-a65d-91ecd839980c	bc3065dc-25e0-4370-8787-73a70187b735	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
a5874de6-bab3-4d61-80ee-c6d36e088f36	f9ab054b-5044-4d1f-adb2-1fd55b21654d	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
9e78a208-1b9c-4283-9637-81c4e77d0920	4881abb1-a300-4491-b821-2425a5fe6fce	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
3ced868e-da58-493b-9b85-9054cab8225b	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
4a8e2e11-064a-4c40-9fee-4a3eca9428b3	6bfd0788-e3db-4152-bccf-f55106aa245a	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
8f9da065-abee-40c3-acb8-701725ae4094	952c74d9-b273-4754-aba6-bc34fb9701ec	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
47327b5a-2a14-4d89-a44f-38f683a70ea2	ba06d626-704c-409c-b8aa-71a5bc198ad2	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
8a0f1a62-8e2a-4c92-b8d4-9daf0b762efd	20ed771d-daec-425e-b0eb-98f72b2859d6	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
c1e62054-1686-4260-9e62-2daadcdc78ed	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
751b67db-66ea-4fd7-8f15-710f32c355da	00237f14-5738-4532-859c-32a61bb899cc	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
1b09f68d-c99a-45c0-aa87-ef7b717292c7	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
7d4bc72d-62c9-4fcf-91f0-5a2347119317	96392161-3983-49a7-9a11-1136da7ba255	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
416ad23d-62ef-46fd-afb1-86d3d34e630d	9ccdfbeb-fc62-4145-877d-a7229bee39e3	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
1d5d3db1-9976-4b3d-b3a3-46eb8da71ae3	920f7ff8-6b17-45b1-b47b-fcbf48402a58	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
765af2fe-8ea1-493a-a39f-5835aa74a76a	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
2afc749b-f695-4df0-8979-ab662a8fca6f	59bd8d15-63fe-4727-9f98-42688a72325f	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
d41d1b0d-3417-401d-a5be-c586f85bac62	1a8df826-f304-4aca-9d68-5b850cb3b565	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
ee380b71-7e72-44c0-bae6-8b8ab7495656	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
67ca8371-ca2a-4ae3-945f-e2f3ed09d708	3d7d77e0-6a1f-425b-a40f-126787eeaa27	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
96484cc3-db70-4a65-bed2-a20280dfd94a	f08b839d-36f6-4ee0-844d-062bad70da11	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
bdb367f2-67fe-459b-a30b-667f82bfd851	73acc6ac-66c5-4440-9974-c353c257783d	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
9a4debc7-f591-4e39-952d-50feb1fe2c2e	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
072453d8-c788-4b17-a80c-ae70192b9b17	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
9998cd98-37bb-4fa4-84cd-49838c38fe8a	92deec47-1731-4087-bd9a-8e0d23be6e17	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
f32a7283-875d-4202-bf8c-23d10813abf0	79ed420e-95a4-41f1-bfc7-2fefc562332c	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
e035ac10-4903-453e-811f-07fb8f558fa9	4911ab4c-0428-4238-bb6f-0405b5987032	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
890a23b9-9ff5-4b97-83a1-7ff6f2c51915	5ca6ef80-8bee-49df-847e-d36707f8f9c4	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
1033b41a-bfb3-46cd-a96e-0fd562e886f5	87f63eb8-ce21-4dad-926a-4d44e223b162	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
603d9af1-b1c6-4bc9-8855-8159ea7424f3	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
320841a0-bde5-4b8b-8b92-14afbe156171	3e1bd274-4570-4da8-b234-ec641068bb86	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
fb1f2a41-3d5f-4bc5-a55b-6308592de331	f2a1aa37-1f9b-4f55-b15d-e61a58728281	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
f96323dd-249b-4654-94bb-d471a1bcca8c	3ed8086b-4e0c-437b-a2ff-14b3baec711b	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
791b8026-fc9c-4cac-8410-5da8bcc850d8	12caa13f-49a0-449d-a877-5d616164605e	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
5e31fd5c-186b-4cdf-87fc-690fb9b52307	4f1ac017-0fc4-4588-8687-9923b4b77a29	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
176c9d6a-7e10-441f-b8e4-3a41b8d027dd	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
5efbc519-6424-42eb-8f47-51af32c5ab25	a4bfb527-4b4a-49d2-be23-3172961a59fe	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
47ad154e-2559-46ac-a279-23f2d03b0841	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
d498ce30-4564-4436-964b-cc0c56ac8c25	157b7924-7095-47da-8a70-9c71826083c6	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
c45f12bf-0913-403a-95b2-cbda8da11a94	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
f8411ce4-97b8-465d-a2dc-bea63cfa4ea4	d3ff8de0-b63b-4612-a1c3-1529e0c35112	2025-26	2	0	0	\N	2026-05-31 06:29:09.919564+00
\.


--
-- Data for Name: teacher_subjects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teacher_subjects (id, teacher_id, subject_id, created_at, teacher_name, subject_name, department_name) FROM stdin;
d245158e-781a-43a8-8a27-097e3835d477	00237f14-5738-4532-859c-32a61bb899cc	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	David Thomas	math	MECH
86e78e46-2fd9-4af0-ab3b-4bf2f3e5a8c6	00237f14-5738-4532-859c-32a61bb899cc	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	David Thomas	data structures	MECH
5620a6b9-195b-44ae-b5fb-0247dd9d6146	00237f14-5738-4532-859c-32a61bb899cc	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	David Thomas	object-oriented techniques	MECH
015384cf-d771-42a1-ae40-def1312344b7	12caa13f-49a0-449d-a877-5d616164605e	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 06:23:41.518079+00	Dr. Preeti Choudhary	COI	EEE
74cb6a1a-b22c-4a63-9e87-d4f12a2763ef	12caa13f-49a0-449d-a877-5d616164605e	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Dr. Preeti Choudhary	mse	EEE
adfcd9b9-5a89-4964-8483-35c69e884d11	12caa13f-49a0-449d-a877-5d616164605e	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Dr. Preeti Choudhary	minor/honors	EEE
bd70134b-3efa-4c62-bc81-7f277c5f3ff1	157b7924-7095-47da-8a70-9c71826083c6	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Prof. Ankit Bhatia	mse	MECH
f246accd-68d1-4f27-b171-dd92cf8df115	157b7924-7095-47da-8a70-9c71826083c6	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	Prof. Ankit Bhatia	computer structures	MECH
88255661-7635-4fc4-9551-44a037f7fb20	157b7924-7095-47da-8a70-9c71826083c6	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Prof. Ankit Bhatia	minor/honors	MECH
a08eb69a-df01-4c49-a8f4-c3503aa2066e	1a8df826-f304-4aca-9d68-5b850cb3b565	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Prof. Vikram Chadha	mse	CS
49d7a41c-f119-468a-8b3d-08955879acaa	1a8df826-f304-4aca-9d68-5b850cb3b565	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Prof. Vikram Chadha	dbms	CS
dc6223b9-0bce-43ed-ab3a-7cd4e3222821	1a8df826-f304-4aca-9d68-5b850cb3b565	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	Prof. Vikram Chadha	object-oriented techniques	CS
6b0bbb62-cb4f-4ec1-914c-d193974e86c2	20ed771d-daec-425e-b0eb-98f72b2859d6	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	George Mathew	math	EC
1930943a-e542-4bce-91f4-c16e78884697	20ed771d-daec-425e-b0eb-98f72b2859d6	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	George Mathew	Python	EC
c79238ee-11de-406f-b61b-3026ed289bea	20ed771d-daec-425e-b0eb-98f72b2859d6	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	George Mathew	data structures	EC
d43d1d09-4bed-4b05-962c-07a4b15e2141	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 06:23:41.518079+00	Ravi Iyer	C	CS
24dd9cc2-30f5-4a12-896f-7e7842a8f261	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Ravi Iyer	dbms	CS
a3e519cb-71af-429b-b5a5-7cb7ae76ac82	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Ravi Iyer	Python	CS
c8f5c105-2ced-4db9-a764-964d668c48ab	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Prof. Pallavi Joshi	Python	IT
75afea7c-083f-48b4-b6f2-65dfa0ed6843	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	Prof. Pallavi Joshi	math	IT
2db30c3b-c231-46f7-9b0d-f5624e02a76e	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Prof. Pallavi Joshi	dbms	IT
39dd01d9-1166-4d9b-a54d-c9c996ac616f	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	Dr. Anita Sharma	math	CS
1fddea4b-41e9-4503-81c2-8aedcf47253a	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Dr. Anita Sharma	mse	CS
5b3fc41c-7baf-4779-ba14-fa96ea97596c	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	Dr. Anita Sharma	data structures	CS
f84f1ec9-94da-4cbb-96c5-7d68fdbb6498	3d7d77e0-6a1f-425b-a40f-126787eeaa27	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Dr. Shreya Sinha	Python	CS
53dda7bd-3a0d-4c09-b48a-6d6fd0461b92	3d7d77e0-6a1f-425b-a40f-126787eeaa27	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Dr. Shreya Sinha	minor/honors	CS
18d21558-6c3b-4675-aff3-e9a5fd9ea8e8	3d7d77e0-6a1f-425b-a40f-126787eeaa27	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	Dr. Shreya Sinha	computer structures	CS
44413ac5-ba84-49b4-aaf9-9512eb07dbc1	3e1bd274-4570-4da8-b234-ec641068bb86	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Prof. Sanjay Mishra	operating systems	EC
a5a1794b-96ae-4b7f-8aac-369cf379a7e8	3e1bd274-4570-4da8-b234-ec641068bb86	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 06:23:41.518079+00	Prof. Sanjay Mishra	C	EC
49927376-5ebc-4146-9532-916c3e2370cf	3e1bd274-4570-4da8-b234-ec641068bb86	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Prof. Sanjay Mishra	dbms	EC
0ad53976-7666-4952-8075-72a6fffb1b77	3ed8086b-4e0c-437b-a2ff-14b3baec711b	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	Prof. Naveen Bansal	data structures	EEE
8adfbe77-c769-4313-af04-b8fbea29a975	3ed8086b-4e0c-437b-a2ff-14b3baec711b	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Prof. Naveen Bansal	communication for engineers	EEE
e314ef98-7e17-45ca-8c7b-a804a35ca610	3ed8086b-4e0c-437b-a2ff-14b3baec711b	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	Prof. Naveen Bansal	object-oriented techniques	EEE
8803621b-aba6-447c-99ef-14e295fc0c78	4881abb1-a300-4491-b821-2425a5fe6fce	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Priya Menon	operating systems	CS
144c2526-b217-4a58-bf62-0e755e5e7546	4881abb1-a300-4491-b821-2425a5fe6fce	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Priya Menon	Python	CS
08803800-d709-4458-91f1-8115817c6551	4881abb1-a300-4491-b821-2425a5fe6fce	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	Priya Menon	math	CS
0bee8055-54c5-43ba-8528-88729a14a7f2	4911ab4c-0428-4238-bb6f-0405b5987032	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Prof. Sunita Rao	communication for engineers	AD
97cd587e-2b39-40db-ac2f-13c3f9ba05aa	4911ab4c-0428-4238-bb6f-0405b5987032	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	Prof. Sunita Rao	data structures	AD
b2e2be47-cf70-42ef-8b30-e03236a6c8ff	4911ab4c-0428-4238-bb6f-0405b5987032	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	Prof. Sunita Rao	object-oriented techniques	AD
efb290bd-e9c3-48b6-a489-a3df9585445f	4f1ac017-0fc4-4588-8687-9923b4b77a29	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	Prof. Rajendra Prasad	data structures	CIVIL
b741d7b7-71db-403b-882b-e5aacedef584	4f1ac017-0fc4-4588-8687-9923b4b77a29	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Prof. Rajendra Prasad	operating systems	CIVIL
e7abaf37-318e-4013-a298-e51cf1a9d0b5	4f1ac017-0fc4-4588-8687-9923b4b77a29	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Prof. Rajendra Prasad	minor/honors	CIVIL
f2a878b6-fc7c-4136-841b-8fc496bc1e10	59bd8d15-63fe-4727-9f98-42688a72325f	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	Dr. Neha Gupta	math	CS
378c34f8-3fc1-487d-b2d9-eba3bab4e90c	59bd8d15-63fe-4727-9f98-42688a72325f	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Dr. Neha Gupta	mse	CS
6da201ef-394c-455e-bdbc-3f50466fff9f	59bd8d15-63fe-4727-9f98-42688a72325f	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Dr. Neha Gupta	Python	CS
c14d8b6f-6485-4537-97ab-3c13b72c9dbc	5ca6ef80-8bee-49df-847e-d36707f8f9c4	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Dr. Alok Srivastava	minor/honors	AD
17dac8ca-6bab-4886-8a41-d38bfa2e59f2	5ca6ef80-8bee-49df-847e-d36707f8f9c4	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Dr. Alok Srivastava	dbms	AD
1903dce3-a46f-46b2-88e9-a94de0406165	5ca6ef80-8bee-49df-847e-d36707f8f9c4	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	Dr. Alok Srivastava	computer structures	AD
1456422d-088e-430d-b63f-442438099c3d	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	Dr. Komal Singh	object-oriented techniques	MECH
5ee8359a-4f94-4235-86e4-66ebc54aaefc	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Dr. Komal Singh	communication for engineers	MECH
c3eef0a6-6c90-4f68-80f7-3975440fe2b4	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Dr. Komal Singh	Python	MECH
9b4cceaa-a455-4b6b-b0d5-963fb44ca0ac	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Sneha Varma	Python	AEI
fd26d0c2-0b7c-4a13-9146-5b7def781d04	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	Sneha Varma	math	AEI
42ade39a-feee-4906-9402-8f3516e09d76	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 06:23:41.518079+00	Sneha Varma	COI	AEI
0f0175dd-28db-48ec-989f-463f148bf285	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	Dr. Rekha Pillai	computer structures	EC
82957ec1-5f4c-4712-92e0-06c6773eabc3	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Dr. Rekha Pillai	operating systems	EC
29721420-ce14-49c6-b0f3-862c50c23601	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	Dr. Rekha Pillai	object-oriented techniques	EC
9118ee2f-79e7-4598-b4fb-512b239d828f	6bfd0788-e3db-4152-bccf-f55106aa245a	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Arjun Nair	operating systems	AD
6969e497-421a-4114-a284-303648ff3a50	6bfd0788-e3db-4152-bccf-f55106aa245a	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Arjun Nair	communication for engineers	AD
9fc2110e-8037-49d3-9d13-3cbc2d99843f	6bfd0788-e3db-4152-bccf-f55106aa245a	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Arjun Nair	minor/honors	AD
b32ee692-8534-43fa-b480-e88afb98961a	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Prof. Asha Nair	Python	AEI
c86c199b-f0c4-48ac-a4a6-e92fc98caa17	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	Prof. Asha Nair	computer structures	AEI
17497bff-2d88-4c59-b8d3-65491fe86c37	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Prof. Asha Nair	communication for engineers	AEI
921080e1-b896-41c5-8d6a-790c38f7b4b7	73acc6ac-66c5-4440-9974-c353c257783d	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Dr. Rajeev Kumar	minor/honors	IT
0c37c806-fb6c-41c1-b815-b3991b944970	73acc6ac-66c5-4440-9974-c353c257783d	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Dr. Rajeev Kumar	Python	IT
80bc2cab-2517-409e-b1f7-0d33e25ddcde	73acc6ac-66c5-4440-9974-c353c257783d	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 06:23:41.518079+00	Dr. Rajeev Kumar	COI	IT
9917c87d-ab09-446c-9e50-5c4b5a1948ba	79ed420e-95a4-41f1-bfc7-2fefc562332c	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	Prof. Varun Saxena	object-oriented techniques	IT
06dc7d3d-32ae-4eca-a9e0-a2330581bed0	79ed420e-95a4-41f1-bfc7-2fefc562332c	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 06:23:41.518079+00	Prof. Varun Saxena	C	IT
394661b8-72fc-492b-baa9-e810c34cf462	79ed420e-95a4-41f1-bfc7-2fefc562332c	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Prof. Varun Saxena	Python	IT
483f3c3e-a3d1-4666-aa09-bdf19b5350f4	87f63eb8-ce21-4dad-926a-4d44e223b162	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 06:23:41.518079+00	Prof. Ajay Nair	COI	EC
b256f7ef-b0b1-4eb8-b830-9e44904f24e9	87f63eb8-ce21-4dad-926a-4d44e223b162	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Prof. Ajay Nair	operating systems	EC
10ed63ac-6d30-4373-a1ec-af4a82c1976f	87f63eb8-ce21-4dad-926a-4d44e223b162	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	Prof. Ajay Nair	object-oriented techniques	EC
531d523c-06e7-465e-b6e1-6b7f213be4da	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	Dr. Manish Arora	computer structures	IT
a01b5ed0-21ab-40a4-a335-73e6debc49e0	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Dr. Manish Arora	operating systems	IT
9d72c725-de5b-495c-8c92-ffd78ef95cef	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Dr. Manish Arora	Python	IT
985a6e54-79de-4067-afd9-bea172488bc1	920f7ff8-6b17-45b1-b47b-fcbf48402a58	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	Dr. Deepa Mehta	data structures	CS
2347278f-15ac-40e4-ad62-e98d1ec440bb	920f7ff8-6b17-45b1-b47b-fcbf48402a58	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Dr. Deepa Mehta	operating systems	CS
99d9704c-cc40-4bfe-99d7-b22bf6ace500	920f7ff8-6b17-45b1-b47b-fcbf48402a58	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Dr. Deepa Mehta	Python	CS
dd8b3b09-8d19-4b48-936d-13a79072b9c2	92deec47-1731-4087-bd9a-8e0d23be6e17	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Prof. Swati Verma	mse	IT
fb66dd5e-61fa-41ac-b0d8-1f4b39f5356c	92deec47-1731-4087-bd9a-8e0d23be6e17	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 06:23:41.518079+00	Prof. Swati Verma	C	IT
95435378-9ef2-4e31-8a51-4ef64808cb4d	92deec47-1731-4087-bd9a-8e0d23be6e17	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Prof. Swati Verma	communication for engineers	IT
956bb5be-cf80-410a-9593-ef02a1f94845	952c74d9-b273-4754-aba6-bc34fb9701ec	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	Lakshmi Rao	math	IT
e9baee48-1fff-405c-870f-775425d55c29	952c74d9-b273-4754-aba6-bc34fb9701ec	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Lakshmi Rao	mse	IT
7b0c9e73-4803-462d-86b8-1a25f6e45647	952c74d9-b273-4754-aba6-bc34fb9701ec	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Lakshmi Rao	Python	IT
3693902b-5b58-4a29-8aa4-56f403722b7f	96392161-3983-49a7-9a11-1136da7ba255	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Rahul Singh	dbms	EEE
fbdfd5b2-563c-4b54-999f-42ee017642f7	96392161-3983-49a7-9a11-1136da7ba255	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Rahul Singh	minor/honors	EEE
9c058707-045c-4870-b9f5-1b1b1443004c	96392161-3983-49a7-9a11-1136da7ba255	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 06:23:41.518079+00	Rahul Singh	COI	EEE
29238d41-41d8-4d16-909d-9e3b779c4120	9ccdfbeb-fc62-4145-877d-a7229bee39e3	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	Prof. Anil Kapoor	math	CS
58152b81-bfc3-45b0-bb84-1c74cd20c856	9ccdfbeb-fc62-4145-877d-a7229bee39e3	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 06:23:41.518079+00	Prof. Anil Kapoor	COI	CS
642164ed-1c43-473e-8485-941e6b272518	9ccdfbeb-fc62-4145-877d-a7229bee39e3	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Prof. Anil Kapoor	Python	CS
c229f1ab-6513-4130-bb42-4930b78c5422	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Kiran Joseph	communication for engineers	CIVIL
c5315891-89d8-418f-89a1-f02cd08cdd6e	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 06:23:41.518079+00	Kiran Joseph	COI	CIVIL
87ce4442-168e-4811-a2b3-aa8b96c38aec	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 06:23:41.518079+00	Kiran Joseph	C	CIVIL
26e6d177-17df-4312-9a93-9bfceb5775e1	a4bfb527-4b4a-49d2-be23-3172961a59fe	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Prof. Harish Kumar	dbms	MECH
57d64568-6557-435d-83d6-259325770e18	a4bfb527-4b4a-49d2-be23-3172961a59fe	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Prof. Harish Kumar	communication for engineers	MECH
df542018-3a56-4b76-91c5-4a4017cdc39b	a4bfb527-4b4a-49d2-be23-3172961a59fe	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Prof. Harish Kumar	mse	MECH
474b91dd-e6d9-4165-9fe6-d377347c247c	ba06d626-704c-409c-b8aa-71a5bc198ad2	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2026-05-31 06:23:41.518079+00	Fatima Khan	math	IT
f5e396f3-b1a6-4e05-9f51-037a961c37b9	ba06d626-704c-409c-b8aa-71a5bc198ad2	79071461-9063-43ef-91f5-c2718a6fd1c5	2026-05-31 06:23:41.518079+00	Fatima Khan	COI	IT
43bf0a89-34f7-4e96-9814-baa503580a58	ba06d626-704c-409c-b8aa-71a5bc198ad2	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	Fatima Khan	data structures	IT
8988f49e-b3c9-449b-8b09-c73c294b59d2	bc3065dc-25e0-4370-8787-73a70187b735	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Dr. Vikram Reddy	mse	EC
a1b77379-d549-44d7-9fe6-2095569ba64e	bc3065dc-25e0-4370-8787-73a70187b735	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 06:23:41.518079+00	Dr. Vikram Reddy	C	EC
37b50cee-3957-42cd-a7b2-48263053a3f7	bc3065dc-25e0-4370-8787-73a70187b735	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Dr. Vikram Reddy	minor/honors	EC
4f08faf7-7798-42bb-8182-628656f05c5a	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Prof. Rajat Sharma	dbms	CS
0813ba80-d3c3-400f-87da-68cd24442398	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Prof. Rajat Sharma	minor/honors	CS
48f2f3f0-24ec-488a-be69-bfa1207eeb11	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 06:23:41.518079+00	Prof. Rajat Sharma	C	CS
f94866a0-23ed-4f2b-a84c-b884fb357a38	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	Dr. Rajesh Kumar	object-oriented techniques	AD
83b83ca2-a29f-46ad-a924-c86039d95e87	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	Dr. Rajesh Kumar	computer structures	AD
1b18dd47-6152-4f65-8118-a03a0143feb1	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Dr. Rajesh Kumar	mse	AD
c1fd3988-4ac0-4cc3-9fff-7299a78f3c21	d3ff8de0-b63b-4612-a1c3-1529e0c35112	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Dr. Ravi Verma	communication for engineers	AEI
d4384ce7-55fd-4901-8508-206a27f708d0	d3ff8de0-b63b-4612-a1c3-1529e0c35112	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	Dr. Ravi Verma	computer structures	AEI
7c387f3f-e7ce-405a-8fc4-edc715125f47	d3ff8de0-b63b-4612-a1c3-1529e0c35112	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Dr. Ravi Verma	minor/honors	AEI
585764cc-7550-4d28-9999-2a7a59bf754c	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	Prof. Aditya Kumar	data structures	CS
7a0a715c-92dd-498e-aef9-7b7f8bca534d	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2026-05-31 06:23:41.518079+00	Prof. Aditya Kumar	communication for engineers	CS
a47928cc-953e-4f59-988d-55d576389833	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Prof. Aditya Kumar	dbms	CS
1fe343a7-fffe-44c1-9304-f5886a6c126a	d6ce58a8-9f9b-4d89-96ec-2541719f5032	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	Dr. Meera Pillai	computer structures	IT
eff1dae4-6775-4bc8-95f3-70599d8253b9	d6ce58a8-9f9b-4d89-96ec-2541719f5032	fb42081d-2f58-480e-8bb9-16ad9e2a8704	2026-05-31 06:23:41.518079+00	Dr. Meera Pillai	minor/honors	IT
d6f3e867-94c0-4ac2-9db1-36b84e4fedfc	d6ce58a8-9f9b-4d89-96ec-2541719f5032	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Dr. Meera Pillai	Python	IT
483a3240-41b6-487d-b82d-b3124abd51cb	f08b839d-36f6-4ee0-844d-062bad70da11	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Prof. Sonia Malhotra	mse	IT
55b5bac1-1845-40fc-927a-69a9b71dd402	f08b839d-36f6-4ee0-844d-062bad70da11	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2026-05-31 06:23:41.518079+00	Prof. Sonia Malhotra	data structures	IT
30ab2bba-8cfb-440b-840b-153597eb3d26	f08b839d-36f6-4ee0-844d-062bad70da11	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	Prof. Sonia Malhotra	Python	IT
48f4c1a3-b3a4-4164-9eb9-278e6c5be676	f2a1aa37-1f9b-4f55-b15d-e61a58728281	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 06:23:41.518079+00	Dr. Nidhi Sharma	C	EC
37296420-2a6b-4958-80a9-efc42c2cc6f2	f2a1aa37-1f9b-4f55-b15d-e61a58728281	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Dr. Nidhi Sharma	operating systems	EC
a5e906d7-4b4a-451a-954e-8adecf7ebcd3	f2a1aa37-1f9b-4f55-b15d-e61a58728281	e02a0a13-6e16-4a07-beab-2c2f31882d73	2026-05-31 06:23:41.518079+00	Dr. Nidhi Sharma	dbms	EC
857541b6-d17d-4951-8467-8fa853cdc48f	f9ab054b-5044-4d1f-adb2-1fd55b21654d	657be3d8-3910-4e25-a30d-db0b6f61551d	2026-05-31 06:23:41.518079+00	John Doe	Python	CS
46ff0122-edda-4c0a-8527-79131b9528d1	f9ab054b-5044-4d1f-adb2-1fd55b21654d	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2026-05-31 06:23:41.518079+00	John Doe	computer structures	CS
a1b348b1-77d0-46cd-91e6-e8cd469d8490	f9ab054b-5044-4d1f-adb2-1fd55b21654d	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2026-05-31 06:23:41.518079+00	John Doe	object-oriented techniques	CS
59d3372a-b09c-4350-b84d-caf7e35e7c75	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	5f11e583-cebc-4eb3-b9df-8a18887fdb80	2026-05-31 06:23:41.518079+00	Dr. Maya Das	operating systems	CIVIL
5dceed55-6711-4b16-933f-145de76f43b0	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2026-05-31 06:23:41.518079+00	Dr. Maya Das	C	CIVIL
8409d15f-d68e-4b4d-9bf1-0f7db7d8f581	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	2026-05-31 06:23:41.518079+00	Dr. Maya Das	mse	CIVIL
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teachers (id, user_id, name, email, department_id, weekly_relief_cap, max_weekly_hours, current_relief_hours, total_hours_worked, is_active, blocked_slots) FROM stdin;
38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	c20d0ab1-b998-43a8-9cc0-795b91965e26	Dr. Anita Sharma	hod.cs@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	5	35	0	0	t	{}
c0bf301a-4f36-4c0a-8983-5de3cf08eff7	c3af7745-4978-484b-b2ce-9a4d5522890d	Dr. Rajesh Kumar	hod.ad@schoolsync.com	681341d4-a7c1-402b-9664-2f388387acfa	5	35	0	0	t	{}
d6ce58a8-9f9b-4d89-96ec-2541719f5032	d17250a2-ba8e-4619-8c20-1e278c136d84	Dr. Meera Pillai	hod.it@schoolsync.com	9098976e-7944-4113-a90f-ce8b3b053eef	5	35	0	0	t	{}
bc3065dc-25e0-4370-8787-73a70187b735	97fdb72a-caa4-4bcd-be47-0fdf22a4900d	Dr. Vikram Reddy	hod.ec@schoolsync.com	09d5a90b-b697-4240-9b42-e52fff482071	5	35	0	0	t	{}
f9ab054b-5044-4d1f-adb2-1fd55b21654d	fa81cfec-48c8-48c1-aae4-6afd7e754738	John Doe	teacher@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
4881abb1-a300-4491-b821-2425a5fe6fce	59f338d8-c321-4163-84fd-8dfd70a030b6	Priya Menon	priya.menon@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	134dcab9-0f4a-4f82-bd81-4b236cd41f8b	Ravi Iyer	ravi.iyer@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
6bfd0788-e3db-4152-bccf-f55106aa245a	0ddf943e-4536-43c8-b75f-f715552e7c9f	Arjun Nair	arjun.nair@schoolsync.com	681341d4-a7c1-402b-9664-2f388387acfa	3	30	0	0	t	{}
952c74d9-b273-4754-aba6-bc34fb9701ec	8c70090f-75b1-4925-9973-2d6b55f15d46	Lakshmi Rao	lakshmi.rao@schoolsync.com	9098976e-7944-4113-a90f-ce8b3b053eef	3	30	0	0	t	{}
ba06d626-704c-409c-b8aa-71a5bc198ad2	2b3df31f-5588-410f-a743-4133a4113d4f	Fatima Khan	fatima.khan@schoolsync.com	9098976e-7944-4113-a90f-ce8b3b053eef	3	30	0	0	t	{}
20ed771d-daec-425e-b0eb-98f72b2859d6	8808dd5b-81fa-4c70-bb1b-9b71231f36b2	George Mathew	george.mathew@schoolsync.com	09d5a90b-b697-4240-9b42-e52fff482071	3	30	0	0	t	{}
5fa0c723-8c64-42ab-9e66-ebe706f0b54b	a4c5d7a1-9b23-439a-9f85-7c0ddee40ea7	Sneha Varma	sneha.varma@schoolsync.com	1da0f888-eab8-43f7-9124-f4506ea82235	3	30	0	0	t	{}
00237f14-5738-4532-859c-32a61bb899cc	4c0e16a7-ac9b-4b24-b432-fb034ab87124	David Thomas	david.thomas@schoolsync.com	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	3	30	0	0	t	{}
9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	6b755b45-302d-4229-b6c0-471384602967	Kiran Joseph	kiran.joseph@schoolsync.com	92c07f66-8e30-4185-879e-ea05e7c404e4	3	30	0	0	t	{}
96392161-3983-49a7-9a11-1136da7ba255	9510a1da-6b81-4073-b6b1-4dc186669c50	Rahul Singh	rahul.singh@schoolsync.com	869d233b-981a-475c-8646-dc511ada08f9	3	30	0	0	t	{}
9ccdfbeb-fc62-4145-877d-a7229bee39e3	3e0241c1-53fa-4747-bb98-da15c34ec63b	Prof. Anil Kapoor	anil.kapoor@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
920f7ff8-6b17-45b1-b47b-fcbf48402a58	9b1630e7-3779-47dc-9b34-0b3015cd551d	Dr. Deepa Mehta	deepa.mehta@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	6f49d040-83ff-4c89-bb4f-9fb6a1730389	Prof. Rajat Sharma	rajat.sharma@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
59bd8d15-63fe-4727-9f98-42688a72325f	2d05a793-b5d8-49c9-ad2c-348744986fbb	Dr. Neha Gupta	neha.gupta@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
1a8df826-f304-4aca-9d68-5b850cb3b565	50cd2f04-0a0f-4136-8f50-666aa94797d5	Prof. Vikram Chadha	vikram.chadha@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	eb08988d-062f-4e7c-baac-f9c4f4ef9ecb	Prof. Aditya Kumar	aditya.kumar@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
3d7d77e0-6a1f-425b-a40f-126787eeaa27	78692641-164c-49e4-bb89-8f9d8972e7cc	Dr. Shreya Sinha	shreya.sinha@schoolsync.com	71bdb722-d7ec-4b12-8b76-9fa6a8d1fd65	3	30	0	0	t	{}
f08b839d-36f6-4ee0-844d-062bad70da11	bb37354c-180e-44b6-8ec5-58b2595cbe2d	Prof. Sonia Malhotra	sonia.malhotra@schoolsync.com	9098976e-7944-4113-a90f-ce8b3b053eef	3	30	0	0	t	{}
73acc6ac-66c5-4440-9974-c353c257783d	6ed09fa4-7624-4082-b2eb-7f9788e014d0	Dr. Rajeev Kumar	rajeev.kumar@schoolsync.com	9098976e-7944-4113-a90f-ce8b3b053eef	3	30	0	0	t	{}
2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	24efee5d-78a5-4d61-a0e7-7f4ed40a471b	Prof. Pallavi Joshi	pallavi.joshi@schoolsync.com	9098976e-7944-4113-a90f-ce8b3b053eef	3	30	0	0	t	{}
8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	e9d8aeeb-d42e-4876-b704-ebc603bf99ca	Dr. Manish Arora	manish.arora@schoolsync.com	9098976e-7944-4113-a90f-ce8b3b053eef	3	30	0	0	t	{}
92deec47-1731-4087-bd9a-8e0d23be6e17	72c020e3-3583-4372-af24-1d071059d240	Prof. Swati Verma	swati.verma@schoolsync.com	9098976e-7944-4113-a90f-ce8b3b053eef	3	30	0	0	t	{}
79ed420e-95a4-41f1-bfc7-2fefc562332c	06178d9d-0b8d-4125-9ad7-50b1ba6db3f8	Prof. Varun Saxena	varun.saxena@schoolsync.com	9098976e-7944-4113-a90f-ce8b3b053eef	3	30	0	0	t	{}
4911ab4c-0428-4238-bb6f-0405b5987032	74d78b52-5626-4a22-9b9b-4c7c3ae9de3c	Prof. Sunita Rao	sunita.rao@schoolsync.com	681341d4-a7c1-402b-9664-2f388387acfa	3	30	0	0	t	{}
5ca6ef80-8bee-49df-847e-d36707f8f9c4	2bba04d8-3092-40d4-8402-e814f11d47d9	Dr. Alok Srivastava	alok.srivastava@schoolsync.com	681341d4-a7c1-402b-9664-2f388387acfa	3	30	0	0	t	{}
87f63eb8-ce21-4dad-926a-4d44e223b162	dac85f89-54c2-4927-b8ac-0a991920cdd8	Prof. Ajay Nair	ajay.nair@schoolsync.com	09d5a90b-b697-4240-9b42-e52fff482071	3	30	0	0	t	{}
5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	ce23f969-fe1f-4888-b857-0fcc9c3ecabd	Dr. Rekha Pillai	rekha.pillai@schoolsync.com	09d5a90b-b697-4240-9b42-e52fff482071	3	30	0	0	t	{}
3e1bd274-4570-4da8-b234-ec641068bb86	7133f043-a2d4-4996-907e-171d4c4dfbf3	Prof. Sanjay Mishra	sanjay.mishra@schoolsync.com	09d5a90b-b697-4240-9b42-e52fff482071	3	30	0	0	t	{}
f2a1aa37-1f9b-4f55-b15d-e61a58728281	0109d6f5-5722-44db-9daf-803783d416d2	Dr. Nidhi Sharma	nidhi.sharma@schoolsync.com	09d5a90b-b697-4240-9b42-e52fff482071	3	30	0	0	t	{}
3ed8086b-4e0c-437b-a2ff-14b3baec711b	7c112acb-d535-40da-9c2c-75ff6fb66329	Prof. Naveen Bansal	naveen.bansal@schoolsync.com	869d233b-981a-475c-8646-dc511ada08f9	3	30	0	0	t	{}
12caa13f-49a0-449d-a877-5d616164605e	1d06e6f7-f62a-464a-b9ca-60fc61d7f8c6	Dr. Preeti Choudhary	preeti.choudhary@schoolsync.com	869d233b-981a-475c-8646-dc511ada08f9	3	30	0	0	t	{}
4f1ac017-0fc4-4588-8687-9923b4b77a29	3ee08463-1c31-4a8b-926c-c3ee961f7448	Prof. Rajendra Prasad	rajendra.prasad@schoolsync.com	92c07f66-8e30-4185-879e-ea05e7c404e4	3	30	0	0	t	{}
fdbcf936-99d5-48b9-8410-eaa6a5b3b137	dd88cdf0-d75c-47fb-aecd-49a8b4ec1390	Dr. Maya Das	maya.das@schoolsync.com	92c07f66-8e30-4185-879e-ea05e7c404e4	3	30	0	0	t	{}
a4bfb527-4b4a-49d2-be23-3172961a59fe	ed37e2a4-691d-4f06-a53b-3dbdbe212ad4	Prof. Harish Kumar	harish.kumar@schoolsync.com	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	3	30	0	0	t	{}
5d50e9da-9113-424b-9c0e-2c2f94a18cc2	59d97ce4-ff79-46c4-8342-a94246a6cabe	Dr. Komal Singh	komal.singh@schoolsync.com	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	3	30	0	0	t	{}
157b7924-7095-47da-8a70-9c71826083c6	e3dc13fb-f7a6-440f-9e28-5d4c96a333b5	Prof. Ankit Bhatia	ankit.bhatia@schoolsync.com	d585b4d5-a4a1-4dc3-aa86-5d540b19af42	3	30	0	0	t	{}
6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	2f14b021-dcfc-40b6-8c3a-3bb36bd38eb2	Prof. Asha Nair	asha.nair@schoolsync.com	1da0f888-eab8-43f7-9124-f4506ea82235	3	30	0	0	t	{}
d3ff8de0-b63b-4612-a1c3-1529e0c35112	7c18a456-76de-434f-b442-81ea36f673a3	Dr. Ravi Verma	ravi.verma@schoolsync.com	1da0f888-eab8-43f7-9124-f4506ea82235	3	30	0	0	t	{}
\.


--
-- Data for Name: timetable_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timetable_slots (id, timetable_version_id, teacher_id, class_id, room_id, subject_id, day_of_week, period, start_time, end_time, is_relief, original_teacher_id) FROM stdin;
d7682686-4413-41e4-87e2-1d0351bab968	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f9ab054b-5044-4d1f-adb2-1fd55b21654d	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
0e0a940e-33e1-4763-9756-20be5902a5af	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	79ed420e-95a4-41f1-bfc7-2fefc562332c	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	657be3d8-3910-4e25-a30d-db0b6f61551d	1	4	\N	\N	f	\N
55392aac-af46-4056-8a9e-939690a879fc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	96392161-3983-49a7-9a11-1136da7ba255	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	79071461-9063-43ef-91f5-c2718a6fd1c5	1	5	\N	\N	f	\N
9c698b28-467a-487b-801f-8b8007e6fb5c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	952c74d9-b273-4754-aba6-bc34fb9701ec	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	1	6	\N	\N	f	\N
6788bb8c-0246-4c86-9881-03febbbc2dc3	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	2	1	\N	\N	f	\N
ad86aedb-2e4b-4afa-b384-b5419a2e9f38	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	00237f14-5738-4532-859c-32a61bb899cc	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
b0dfe876-f244-4ddb-9029-394545f72572	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
547367f9-2369-4504-b2ed-0a555fe485fb	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d3ff8de0-b63b-4612-a1c3-1529e0c35112	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
a58574a5-a2b5-421c-9b56-4f35a0c8e41c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
50763745-592e-43a9-bc7e-2d18291d929b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
c2014af4-538b-43dc-93eb-857e66008ad9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	a4bfb527-4b4a-49d2-be23-3172961a59fe	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
58e3de1e-22d7-4a97-9fa5-f61323354a1b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	12caa13f-49a0-449d-a877-5d616164605e	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
b9739ae2-d556-4562-8452-82fbc76373da	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6bfd0788-e3db-4152-bccf-f55106aa245a	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
7321ceba-534f-41ce-bf5d-59c293bf012f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	920f7ff8-6b17-45b1-b47b-fcbf48402a58	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	657be3d8-3910-4e25-a30d-db0b6f61551d	3	4	\N	\N	f	\N
44d43674-be47-45b6-9064-a6e2b20d9cd4	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	79071461-9063-43ef-91f5-c2718a6fd1c5	3	5	\N	\N	f	\N
4f2f9953-d765-40f0-a0bf-e3bf894852f2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4881abb1-a300-4491-b821-2425a5fe6fce	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	3	6	\N	\N	f	\N
88b006ef-8738-4a3b-8f17-978ee8bd6379	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	79ed420e-95a4-41f1-bfc7-2fefc562332c	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	4	1	\N	\N	f	\N
c818ba37-8558-4005-a23e-cbc119f5fb7b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4911ab4c-0428-4238-bb6f-0405b5987032	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
6cad2339-cb10-41ce-8b75-6ba6280e0a5e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f9ab054b-5044-4d1f-adb2-1fd55b21654d	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
f267a2ea-31ee-4d93-ac1a-c9c8e8a31308	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
53a576b0-9b84-40f7-a624-c467d10bd667	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
fcecdb28-35f4-47a4-a056-ffc00b49511f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f2a1aa37-1f9b-4f55-b15d-e61a58728281	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
1d2cb2aa-1a3d-469d-96d3-6c0839eed301	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	59bd8d15-63fe-4727-9f98-42688a72325f	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
dcc06c9b-2dd5-49ae-bccc-298359fd4207	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	00237f14-5738-4532-859c-32a61bb899cc	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
8ffe7c7e-a53f-46fc-a0bd-83f1eea9f0c0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	20ed771d-daec-425e-b0eb-98f72b2859d6	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
77d218bb-d313-4912-b465-bdcddf8e5dd3	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	157b7924-7095-47da-8a70-9c71826083c6	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
3772889f-8a60-4175-a4f2-c31a485eb88f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3ed8086b-4e0c-437b-a2ff-14b3baec711b	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
fe8186b4-bd99-4c29-8f6c-94dfc62cd601	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	1a8df826-f304-4aca-9d68-5b850cb3b565	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
fc514f2a-5b70-4712-b68a-a6da5e00bc04	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
6867ef59-86b5-4b74-beba-7d9fb640ce82	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	12caa13f-49a0-449d-a877-5d616164605e	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
5fd31f88-9bd3-462f-abf8-924b81e1b795	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3d7d77e0-6a1f-425b-a40f-126787eeaa27	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
803961af-a2f8-45cc-856c-9aa967310580	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3e1bd274-4570-4da8-b234-ec641068bb86	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
048a94a5-41cd-4e3c-a99a-ef8722af2e14	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	79071461-9063-43ef-91f5-c2718a6fd1c5	1	4	\N	\N	f	\N
6b90f59e-ea7d-4b95-8e45-dd71087e4a2f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	657be3d8-3910-4e25-a30d-db0b6f61551d	1	5	\N	\N	f	\N
b09ad5d1-bdf2-4614-9ea8-a62ddd4f0dda	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	79ed420e-95a4-41f1-bfc7-2fefc562332c	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	1	6	\N	\N	f	\N
bf59b229-d4ba-4eb3-bb34-e8939e6f25e0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2	1	\N	\N	f	\N
c701c202-79ed-408a-bdbf-24c575e6ce02	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4911ab4c-0428-4238-bb6f-0405b5987032	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
a3eea634-0044-489b-970c-abbe942fe167	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5ca6ef80-8bee-49df-847e-d36707f8f9c4	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
cdcbe23d-9a98-4de5-8eae-c7468cb415b3	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
7edcde5b-0e70-4b63-b375-402fc79e4cb2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
9371b5ae-7ea0-4bf9-9c88-f5721bd244ff	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	96392161-3983-49a7-9a11-1136da7ba255	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
8db3aba3-8831-4fdf-aa1b-213a4d8d6650	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4f1ac017-0fc4-4588-8687-9923b4b77a29	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
33338c63-e647-447d-99ad-a9a785f3ca96	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4881abb1-a300-4491-b821-2425a5fe6fce	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
14ba8d2f-7255-4bc1-ba96-babc661481ab	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	73acc6ac-66c5-4440-9974-c353c257783d	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	79071461-9063-43ef-91f5-c2718a6fd1c5	3	4	\N	\N	f	\N
4b47a4f5-8bc6-4742-96f8-b0c5a398b4ab	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	657be3d8-3910-4e25-a30d-db0b6f61551d	3	5	\N	\N	f	\N
7e89275b-2216-45c3-b409-40d80ef47fdc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	92deec47-1731-4087-bd9a-8e0d23be6e17	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	3	6	\N	\N	f	\N
cfcd8400-efb9-462e-b83f-fefbd2946434	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	952c74d9-b273-4754-aba6-bc34fb9701ec	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	4	1	\N	\N	f	\N
520bd027-9656-4f09-b467-b4326cf1253a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	920f7ff8-6b17-45b1-b47b-fcbf48402a58	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
4aa3add0-8acc-480a-93f8-10ffbefa0ff5	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
dc332ca7-ec66-4bfe-bcba-d1f6e6d12929	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6bfd0788-e3db-4152-bccf-f55106aa245a	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
4a5c194f-488d-4850-8bd0-de1807411e11	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	87f63eb8-ce21-4dad-926a-4d44e223b162	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
e674b89c-b048-4b58-97dd-41a46609fade	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	a4bfb527-4b4a-49d2-be23-3172961a59fe	224026d8-9ea6-4e3a-8183-923e8d6e8709	8014f294-0b51-4db3-ac8c-ef5d83c191e2	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
111818e3-0ee9-4ef8-b7d7-99022a3b4762	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9ccdfbeb-fc62-4145-877d-a7229bee39e3	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
16269911-4579-4ba3-b994-6b8b834d81b5	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	ba06d626-704c-409c-b8aa-71a5bc198ad2	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
bf7f5666-049e-4352-b457-bc04beaf8707	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
b74ecb09-5595-4733-8245-ae342d8d740d	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
393ca0e7-caa0-41ae-8f2c-84bdb8ed67fc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f9ab054b-5044-4d1f-adb2-1fd55b21654d	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
be34d429-8a14-4e44-a525-060622b1a97c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
32887b3f-32cd-406f-b82a-2bb3a4985178	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bc3065dc-25e0-4370-8787-73a70187b735	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
23222e72-2be9-42a3-93e5-463bb4ff4c60	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d3ff8de0-b63b-4612-a1c3-1529e0c35112	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
13860911-73f2-4f4b-96aa-34a4c4cc866f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f2a1aa37-1f9b-4f55-b15d-e61a58728281	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
e9ac69f4-a1f0-4e12-9ae6-9bc561cb9b08	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	12caa13f-49a0-449d-a877-5d616164605e	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	79071461-9063-43ef-91f5-c2718a6fd1c5	1	4	\N	\N	f	\N
f6489c75-7c05-4ed0-b49f-37915fdf5e05	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d6ce58a8-9f9b-4d89-96ec-2541719f5032	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	657be3d8-3910-4e25-a30d-db0b6f61551d	1	5	\N	\N	f	\N
21c2ca86-bc74-4708-9070-809d2722204a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	1	6	\N	\N	f	\N
705f53a5-dba6-4ed4-8929-5daf7897b669	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	00237f14-5738-4532-859c-32a61bb899cc	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2	1	\N	\N	f	\N
521e4326-3c5d-42e1-adf1-28a495f2c004	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
3b49e9d7-f840-40e4-b3d0-0cd355485de3	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	157b7924-7095-47da-8a70-9c71826083c6	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
408d0eef-ba50-46e6-87ee-4c89e71b4a69	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3ed8086b-4e0c-437b-a2ff-14b3baec711b	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
08a291b1-a8fc-4b30-ba4e-f05fcfbfc7a6	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	1a8df826-f304-4aca-9d68-5b850cb3b565	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
f93b11c2-f0e4-4821-bc85-450fde7ebdb9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
1f29d247-e958-4351-8e65-48bb8a5c7098	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f08b839d-36f6-4ee0-844d-062bad70da11	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
e17f522d-4e29-4e54-b653-6616a1656da2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3d7d77e0-6a1f-425b-a40f-126787eeaa27	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
d9ed5f72-6741-4722-85da-2c27bb912248	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3e1bd274-4570-4da8-b234-ec641068bb86	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
f8e34b58-c8d0-47b8-954f-8e2a002c5ea2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	79071461-9063-43ef-91f5-c2718a6fd1c5	3	4	\N	\N	f	\N
58f85c02-265f-4712-bd7f-e9bc761aff1d	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	20ed771d-daec-425e-b0eb-98f72b2859d6	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	657be3d8-3910-4e25-a30d-db0b6f61551d	3	5	\N	\N	f	\N
69ec0f88-af86-445d-89d9-b3d4d632ad79	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	79ed420e-95a4-41f1-bfc7-2fefc562332c	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	3	6	\N	\N	f	\N
caa0ef10-34ff-42ca-90fc-3414f28ba3a5	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	4	1	\N	\N	f	\N
a5334992-430f-4e4e-89e8-8b3173bbf226	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
0af28425-6bca-4334-b55a-289326f2ad99	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5ca6ef80-8bee-49df-847e-d36707f8f9c4	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
24777e73-ec6b-433b-954e-9741b3e6e96a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4911ab4c-0428-4238-bb6f-0405b5987032	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
58ea4efb-df89-43fa-acdd-3f9a34d34e81	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
f74b5b9d-c041-4f1a-ae20-1a5ddcf1e9bf	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	96392161-3983-49a7-9a11-1136da7ba255	221a5345-1279-484f-a936-c68685a50518	7a47f680-150c-46c6-9872-ef797438f56d	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
16dcdfcc-47cd-469b-a890-36e0015c99b6	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4881abb1-a300-4491-b821-2425a5fe6fce	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
928e8347-a5ab-4144-b6f3-bb9a25ac2aa5	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4f1ac017-0fc4-4588-8687-9923b4b77a29	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
0de49e81-7e03-4e0f-9305-278685913a57	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
fee5d504-f6e1-4dcd-ba94-e305e965b82e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6bfd0788-e3db-4152-bccf-f55106aa245a	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
b6b61af6-0f37-4436-82e8-c9131d276fb0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	87f63eb8-ce21-4dad-926a-4d44e223b162	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
0984e843-6b34-4d3e-ab4c-97d8eb424fc2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	a4bfb527-4b4a-49d2-be23-3172961a59fe	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
d4efb726-b789-437e-8a56-890dafd29d7c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	59bd8d15-63fe-4727-9f98-42688a72325f	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
6514bddf-c337-4b17-903f-da14cb01615f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	73acc6ac-66c5-4440-9974-c353c257783d	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
9e12f474-77d9-4bcc-a83e-552dbff52a9e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
1dadedc9-d36e-43e4-b100-3737ccb0e93a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9ccdfbeb-fc62-4145-877d-a7229bee39e3	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	79071461-9063-43ef-91f5-c2718a6fd1c5	1	4	\N	\N	f	\N
944b3ab5-f211-4667-abe8-01171d4cb727	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	657be3d8-3910-4e25-a30d-db0b6f61551d	1	5	\N	\N	f	\N
a1421e21-8ba0-4f7b-8e64-13003a837ce1	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	92deec47-1731-4087-bd9a-8e0d23be6e17	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	1	6	\N	\N	f	\N
644e1d0f-bdb3-46e8-b9b2-9eddc892c879	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	952c74d9-b273-4754-aba6-bc34fb9701ec	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2	1	\N	\N	f	\N
d263d10e-886f-4d4c-ad61-d16809c716ac	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	920f7ff8-6b17-45b1-b47b-fcbf48402a58	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
3252382f-085f-4813-b4fe-d9058c28a50c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
3bca362a-15f8-446e-9ca9-a9190aee781f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
0a09e6ff-c2c6-43a2-b5d7-42220b2f5f05	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f9ab054b-5044-4d1f-adb2-1fd55b21654d	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
1fd5e1fa-a66b-461f-bec5-516d8ccc8d37	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
e2423e45-afc3-409c-8ad9-2ae833086282	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bc3065dc-25e0-4370-8787-73a70187b735	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
6606567a-a350-4ded-98d7-e1a33e1e44c9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d3ff8de0-b63b-4612-a1c3-1529e0c35112	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
3ee20bdb-b662-43e3-8712-ff91b205f3e9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f2a1aa37-1f9b-4f55-b15d-e61a58728281	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
c5eac066-3468-4260-bb9c-c75f68a68474	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	ba06d626-704c-409c-b8aa-71a5bc198ad2	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	79071461-9063-43ef-91f5-c2718a6fd1c5	3	4	\N	\N	f	\N
4363f6e2-d5fb-45c1-8fe3-96f2c1fa1076	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d6ce58a8-9f9b-4d89-96ec-2541719f5032	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	657be3d8-3910-4e25-a30d-db0b6f61551d	3	5	\N	\N	f	\N
b743b65d-2508-4cb5-b396-e012174370cc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	3	6	\N	\N	f	\N
dd9ecb8f-9be6-4381-b174-e294a630ebbb	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	00237f14-5738-4532-859c-32a61bb899cc	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	4	1	\N	\N	f	\N
8faefb8b-1416-461b-8979-360f0883c8ae	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
4c797122-f2f2-4229-99b5-d9c10845f1b1	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	157b7924-7095-47da-8a70-9c71826083c6	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
a9d938b7-76ac-4efa-ada1-fc449d450b93	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3ed8086b-4e0c-437b-a2ff-14b3baec711b	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
8e3e521e-a561-4607-9a73-a0e60c106d8c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	1a8df826-f304-4aca-9d68-5b850cb3b565	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
282a7153-c5d1-4a61-bc1b-d5499a4e83fc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	b40d6ef6-98b6-4306-be74-a9e9dd15e432	b3452cdd-0a4a-449b-aaa7-a39955d71fd6	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
4bbbaec0-3ac9-4981-8a9b-6a1d5a9e933d	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	20ed771d-daec-425e-b0eb-98f72b2859d6	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
57033cae-7d25-45d8-bc1d-a5177768a983	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f08b839d-36f6-4ee0-844d-062bad70da11	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
2920c73a-2390-42b6-8fdb-56b94e19a57f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3d7d77e0-6a1f-425b-a40f-126787eeaa27	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
992343fc-0c84-4402-82e8-ddaa8df037eb	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4911ab4c-0428-4238-bb6f-0405b5987032	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
fc6a5d7d-71a4-4e39-bd35-e33162410f5a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
2fab4b50-9a09-40b5-a77a-4d2cebdf5774	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
5b701e98-d185-4201-a80c-55dd18420db7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
ef2fd118-3189-488a-a058-7448262c981c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	12caa13f-49a0-449d-a877-5d616164605e	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
482c0c73-0989-4573-830d-c57adbdac2df	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4881abb1-a300-4491-b821-2425a5fe6fce	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
65995bdc-1b3e-4db6-8460-f07e22fafb8a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	73acc6ac-66c5-4440-9974-c353c257783d	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	79071461-9063-43ef-91f5-c2718a6fd1c5	1	4	\N	\N	f	\N
f977b0cf-dd13-49b1-a4f8-0b00eb141b14	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	59bd8d15-63fe-4727-9f98-42688a72325f	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	657be3d8-3910-4e25-a30d-db0b6f61551d	1	5	\N	\N	f	\N
85a3949e-7e09-4236-b24c-30cf8ee885e5	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3e1bd274-4570-4da8-b234-ec641068bb86	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	1	6	\N	\N	f	\N
3992ce0b-51de-4edd-8023-bb2aa69941c6	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2	1	\N	\N	f	\N
ae5194b2-bb7b-4e5b-9708-ba30b3caee80	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4f1ac017-0fc4-4588-8687-9923b4b77a29	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
38c786d2-7ce6-49ba-9e36-070a568d980e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
3a0f462a-ab47-4d6d-b392-0abda6715021	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6bfd0788-e3db-4152-bccf-f55106aa245a	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
d13436c5-9af3-4ba2-bec4-e4ca31f95194	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	79ed420e-95a4-41f1-bfc7-2fefc562332c	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
a6be1615-c023-4d27-a1f1-f3b94cfeb25c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5ca6ef80-8bee-49df-847e-d36707f8f9c4	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
6ebe7624-96d4-4151-90b1-0b875f2badcc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	92deec47-1731-4087-bd9a-8e0d23be6e17	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
0a48257f-2b9c-485e-adfb-824d305b29c9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	96392161-3983-49a7-9a11-1136da7ba255	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
755c669f-ffda-4940-8331-ba23a3de8841	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	87f63eb8-ce21-4dad-926a-4d44e223b162	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
1772ad1e-82a3-48d5-a99d-d7a382efe98e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9ccdfbeb-fc62-4145-877d-a7229bee39e3	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	79071461-9063-43ef-91f5-c2718a6fd1c5	3	4	\N	\N	f	\N
22d1a6a1-9a1e-47ff-a681-720eca289b1e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	657be3d8-3910-4e25-a30d-db0b6f61551d	3	5	\N	\N	f	\N
e64b7cf0-07ef-4f10-9bd0-2da454ca384f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	3	6	\N	\N	f	\N
f3f664e5-ae1f-404e-9423-986c89457e91	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	ba06d626-704c-409c-b8aa-71a5bc198ad2	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	4	1	\N	\N	f	\N
f015f0ca-c9de-4d12-bf7a-3fd4694fbd1a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f08b839d-36f6-4ee0-844d-062bad70da11	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
0b054b2b-82e6-4dee-bbac-3545921fa606	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
3ba3556c-b001-4edf-85e5-e025d662546e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	a4bfb527-4b4a-49d2-be23-3172961a59fe	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
d781f191-02d4-4467-bb5b-3e3aac17dd95	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
fb118463-2a2e-42b9-9822-69dd3a831ca1	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	2272e738-3976-40d9-afee-3bd85a03caa8	a99083e3-f4a3-430c-9ee1-d5691f3b8fa8	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
5b744c11-cbad-41b4-94be-3775e4217a54	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	952c74d9-b273-4754-aba6-bc34fb9701ec	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
3685428e-3538-4754-80e7-4508756d6ee9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	920f7ff8-6b17-45b1-b47b-fcbf48402a58	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
3b044e0b-ef1e-4be3-8f0f-dadd46d09ae7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d3ff8de0-b63b-4612-a1c3-1529e0c35112	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
142ba8e0-be64-4115-bc0c-f53d13d176f3	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
996b8a05-9c49-4caa-a268-04e8e4d27586	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	00237f14-5738-4532-859c-32a61bb899cc	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
ff33a0c1-91ec-4996-9fa5-ea22c3342294	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f2a1aa37-1f9b-4f55-b15d-e61a58728281	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
9ff0289d-c683-4eb2-bb5b-024f0ed8a34a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
155137fa-b69c-4226-a0e8-01ba1f083895	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bc3065dc-25e0-4370-8787-73a70187b735	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
25ad1852-bd58-4135-bb55-4e1ae4bc14af	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4f1ac017-0fc4-4588-8687-9923b4b77a29	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
7d456ffa-294e-43aa-8477-bd74747efccc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	87f63eb8-ce21-4dad-926a-4d44e223b162	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	79071461-9063-43ef-91f5-c2718a6fd1c5	1	4	\N	\N	f	\N
1445492a-98ca-4da0-a94c-6aea959858af	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f9ab054b-5044-4d1f-adb2-1fd55b21654d	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	657be3d8-3910-4e25-a30d-db0b6f61551d	1	5	\N	\N	f	\N
d11bfa47-10f3-4f03-84dc-82287b881319	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	1	6	\N	\N	f	\N
3f3f6364-e080-40fe-a508-a01ae39f8179	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	20ed771d-daec-425e-b0eb-98f72b2859d6	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2	1	\N	\N	f	\N
35a48b6d-d4eb-4a87-9688-9a7d3553fc2f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d6ce58a8-9f9b-4d89-96ec-2541719f5032	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
ec185c05-19c6-421b-95e5-4f6400dd60a0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4911ab4c-0428-4238-bb6f-0405b5987032	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
98f611b2-adb4-4740-99c9-e52b7b5d889d	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3ed8086b-4e0c-437b-a2ff-14b3baec711b	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
2323b40a-76cf-4e16-a83d-56fab6c9a2c8	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	1a8df826-f304-4aca-9d68-5b850cb3b565	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
7a7976bd-9f1b-44b2-a3d8-98ebc7630d79	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	12caa13f-49a0-449d-a877-5d616164605e	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
9e3d6765-93ed-4c0a-9fba-b5f675a38efd	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	157b7924-7095-47da-8a70-9c71826083c6	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
7952bbfd-4059-4041-8e2e-7daaf1292bbb	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
78415cef-0134-4796-b082-3ab8a5fff324	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	96392161-3983-49a7-9a11-1136da7ba255	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	79071461-9063-43ef-91f5-c2718a6fd1c5	3	4	\N	\N	f	\N
809b2ee8-bc4a-42b3-ab97-162a39807767	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	657be3d8-3910-4e25-a30d-db0b6f61551d	3	5	\N	\N	f	\N
0023549b-aa01-46ab-a90c-aaf149290ab9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3e1bd274-4570-4da8-b234-ec641068bb86	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	3	6	\N	\N	f	\N
0d4f2e12-e9c4-414e-a649-7245f735488a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4881abb1-a300-4491-b821-2425a5fe6fce	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	4	1	\N	\N	f	\N
fcf11924-8396-4748-bfdc-97d1301f96e4	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	ba06d626-704c-409c-b8aa-71a5bc198ad2	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
4b9132cc-3791-4294-9922-c7d003fca044	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3d7d77e0-6a1f-425b-a40f-126787eeaa27	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
881cfe22-8e86-438f-9ad9-e15c0b1f9a66	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
92d7eb4d-87dd-4caf-bde2-58f4501686c8	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	79ed420e-95a4-41f1-bfc7-2fefc562332c	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
f3e1e12c-b86b-4f15-b62d-60f2cf744a8d	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5ca6ef80-8bee-49df-847e-d36707f8f9c4	9adba716-7432-495a-ad2f-1b59f9263e7c	76e45a9e-3440-4fe4-add0-ec7d313a475b	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
9b34e122-517b-4ce0-a392-7e8dd6cc95d8	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	59bd8d15-63fe-4727-9f98-42688a72325f	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
6d3aacc4-b8b7-46e0-96ec-14d16b6dfa39	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
a0b49e0b-3aed-4726-84a7-411128ac2df9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
27298e2e-3dbb-4842-85f1-6725b712628d	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	92deec47-1731-4087-bd9a-8e0d23be6e17	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
fd7ef3a5-7d93-4c96-aa72-85b372fe49b9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
9ca6def8-c2df-48c1-bf15-220e8b314167	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	1a8df826-f304-4aca-9d68-5b850cb3b565	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
686b4d93-2caf-417c-95f8-ea1dca6ecf05	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	952c74d9-b273-4754-aba6-bc34fb9701ec	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
794ec2ed-6622-431f-bfb6-a4e3d388b320	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6bfd0788-e3db-4152-bccf-f55106aa245a	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
f1babe06-8f65-4b53-92ee-04c4b2e9cd02	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	920f7ff8-6b17-45b1-b47b-fcbf48402a58	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
79397e0d-782a-412b-9a78-0ababe31672e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	79071461-9063-43ef-91f5-c2718a6fd1c5	1	4	\N	\N	f	\N
4c128401-152c-4a29-8559-93eb2bd0af07	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	657be3d8-3910-4e25-a30d-db0b6f61551d	1	5	\N	\N	f	\N
7a8884bf-8f3c-4b76-ba06-367f49c68e1e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bc3065dc-25e0-4370-8787-73a70187b735	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	1	6	\N	\N	f	\N
f0d3153c-99e6-480d-8eb2-e52e7e451905	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9ccdfbeb-fc62-4145-877d-a7229bee39e3	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2	1	\N	\N	f	\N
45a40173-b972-4cf2-9fd8-74a3abd6d2a2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f08b839d-36f6-4ee0-844d-062bad70da11	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
2b2a2737-0a4e-4878-ba5d-54dc714596d1	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
67200681-e28f-4d86-a094-bff2ec67368c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	a4bfb527-4b4a-49d2-be23-3172961a59fe	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
da613831-7663-43be-9bd6-b4ea2ea932d2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	00237f14-5738-4532-859c-32a61bb899cc	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
6a9b851e-41de-4895-8fb0-b2f963a9a382	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f2a1aa37-1f9b-4f55-b15d-e61a58728281	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
b03be71c-d0bb-479b-bcbf-fe185ae985d2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
364fd833-3039-4740-86d6-22ff8b564e47	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	73acc6ac-66c5-4440-9974-c353c257783d	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
28d019c9-8415-400a-8dec-65e132dee382	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4f1ac017-0fc4-4588-8687-9923b4b77a29	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
13341668-7677-4b64-a752-873fb8701375	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	12caa13f-49a0-449d-a877-5d616164605e	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	79071461-9063-43ef-91f5-c2718a6fd1c5	3	4	\N	\N	f	\N
f4d3fc04-cfb8-4fb6-ba4e-db3b4e3e39b9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f9ab054b-5044-4d1f-adb2-1fd55b21654d	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	657be3d8-3910-4e25-a30d-db0b6f61551d	3	5	\N	\N	f	\N
dae615a7-b762-4bef-97b3-4f4b261233f7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	3	6	\N	\N	f	\N
5d267581-ced1-4c67-ae20-8fa8d0536277	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	20ed771d-daec-425e-b0eb-98f72b2859d6	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	4	1	\N	\N	f	\N
42703615-6e12-40ba-86f0-f3babc76c504	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3ed8086b-4e0c-437b-a2ff-14b3baec711b	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
6d051684-38c9-4d51-9607-4966e256d9ed	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d3ff8de0-b63b-4612-a1c3-1529e0c35112	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
248fad60-ddba-4c77-b9ff-d82e33b0cc8b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
584a3b3c-0a6b-4ace-8f4c-e4899f79e088	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4911ab4c-0428-4238-bb6f-0405b5987032	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
93070e90-8bff-4447-b628-d9c6f86bb4ba	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	52ceb9dc-0d7a-4309-bee4-f201ea634c76	c26eb94e-5df2-4c4b-abb6-fbfdb44a0c10	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
0dafa2f7-593a-453c-83ab-ab52330f2fcc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
e5df9976-5f19-43f4-a60c-71841012c17b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	00237f14-5738-4532-859c-32a61bb899cc	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
ba1ae18d-386c-4d44-b6f0-e049cc88f6e2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d6ce58a8-9f9b-4d89-96ec-2541719f5032	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
fdf01fa1-e8fe-45c2-8440-96458df5786d	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
a3354bca-540c-4236-8b20-554bf8deb2bf	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
10f18f4f-b483-4d47-8aee-7f83cac32444	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3e1bd274-4570-4da8-b234-ec641068bb86	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
872f0618-b6b1-4bf5-8c37-8d0780a28ba0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	157b7924-7095-47da-8a70-9c71826083c6	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
324d6462-dd2d-4708-adc0-3bca21af8669	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5ca6ef80-8bee-49df-847e-d36707f8f9c4	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
8b5dd278-8be1-4af0-9c71-e3d024c7a4f0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6bfd0788-e3db-4152-bccf-f55106aa245a	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
5aead68e-0aaa-499d-865c-af4aded1b8b7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	96392161-3983-49a7-9a11-1136da7ba255	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	79071461-9063-43ef-91f5-c2718a6fd1c5	1	4	\N	\N	f	\N
6bcfadae-5595-4cd5-a015-e9b5413cd741	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	657be3d8-3910-4e25-a30d-db0b6f61551d	1	5	\N	\N	f	\N
fd9b51cb-f342-4fa6-b192-1e00db6d89d0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	1	6	\N	\N	f	\N
96c44732-9d97-48c0-b08d-9a5b7b65a7c7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4881abb1-a300-4491-b821-2425a5fe6fce	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2	1	\N	\N	f	\N
44069436-526c-4ad0-acfa-5aedb09a7be3	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	ba06d626-704c-409c-b8aa-71a5bc198ad2	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
8e215c3c-ecf7-4cd3-a367-9ade59146c31	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3d7d77e0-6a1f-425b-a40f-126787eeaa27	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
05209faf-86fd-4947-b36d-14b90f1836a2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	92deec47-1731-4087-bd9a-8e0d23be6e17	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
bfc64685-9f72-4b76-b560-098638e03740	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	87f63eb8-ce21-4dad-926a-4d44e223b162	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
d750acd6-4bc8-40e3-b748-dcd34240720b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	a4bfb527-4b4a-49d2-be23-3172961a59fe	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
d42099a0-3926-467f-87bb-c9699c9e11fb	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	952c74d9-b273-4754-aba6-bc34fb9701ec	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
c41bbadf-a236-45a9-8da1-1d3e06d802ae	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bc3065dc-25e0-4370-8787-73a70187b735	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
0ed68a7b-52ae-42a7-8d63-0eee4ee67d7c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
f07992ae-ae80-4cbe-a5ea-1404e8a3ae75	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	87f63eb8-ce21-4dad-926a-4d44e223b162	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	79071461-9063-43ef-91f5-c2718a6fd1c5	3	4	\N	\N	f	\N
9d0c2418-8ea1-4372-9efd-029e1c6e21f6	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	59bd8d15-63fe-4727-9f98-42688a72325f	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	657be3d8-3910-4e25-a30d-db0b6f61551d	3	5	\N	\N	f	\N
362d90a0-8bc0-4697-9e4f-e0869e9e640d	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f2a1aa37-1f9b-4f55-b15d-e61a58728281	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	3	6	\N	\N	f	\N
20a28101-9f71-49ac-ad48-d6b2df7f892b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	4	1	\N	\N	f	\N
5a51b0dc-2eb1-4a8e-a328-1aa3742fd178	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	20ed771d-daec-425e-b0eb-98f72b2859d6	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
9485bbb3-6f8e-48da-96ed-5c707ff6c6c7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
908415e3-128f-4224-a0a1-a9a719f18e54	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d3ff8de0-b63b-4612-a1c3-1529e0c35112	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
8339bcb2-3f09-402a-91e5-33a430720eb2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f9ab054b-5044-4d1f-adb2-1fd55b21654d	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
82f762cf-6b4c-4b36-8806-17ef2f310fa2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	8f6e9d95-f6e6-493d-859f-58aad0df47af	fbe17642-98ac-4ac9-8480-dd5fd62e85a5	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
57eac9a2-675d-4d73-b018-3d0db50151af	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
e2906c38-60b1-445e-bb1c-f578ded461c5	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
68f0c5df-1c5b-42fd-9661-1c382b5a4a94	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5ca6ef80-8bee-49df-847e-d36707f8f9c4	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
29e47c00-3807-4ec6-9fe5-97584df73e72	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
fc99c038-fbf0-4c8f-80e2-52213f1cc19c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	79ed420e-95a4-41f1-bfc7-2fefc562332c	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
c212b255-0950-468f-a112-e3be499140ee	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	96392161-3983-49a7-9a11-1136da7ba255	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
61bf4b63-11df-4862-b12b-a9d8f88e1368	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f08b839d-36f6-4ee0-844d-062bad70da11	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
626d2d0f-cc1b-4393-9b36-e8c809949c4a	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
88dcb284-9cff-4c96-b283-ff220cc86cad	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
91dcb774-0a0a-46a6-9679-829c51cc8239	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	ba06d626-704c-409c-b8aa-71a5bc198ad2	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	79071461-9063-43ef-91f5-c2718a6fd1c5	1	4	\N	\N	f	\N
8a74631f-0aae-4e1d-bce5-05772886c8bd	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	73acc6ac-66c5-4440-9974-c353c257783d	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	657be3d8-3910-4e25-a30d-db0b6f61551d	1	5	\N	\N	f	\N
e47cbebc-88bf-4772-88ae-453b72817a35	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bfb3460e-2cbd-44a1-8a2e-95dd8712dcda	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	1	6	\N	\N	f	\N
d5e076ab-6b3b-4edc-ac47-0c960c409543	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	59bd8d15-63fe-4727-9f98-42688a72325f	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2	1	\N	\N	f	\N
747bf4a2-c687-4485-b6e4-9115c7fccdb7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3ed8086b-4e0c-437b-a2ff-14b3baec711b	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
6f82451e-18be-4d3f-a848-96feb09d23ea	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d3ff8de0-b63b-4612-a1c3-1529e0c35112	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
c148838f-949a-44ee-8bbf-6a09292540df	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
46564f6c-83e8-4943-b970-ca1a16d121cf	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4911ab4c-0428-4238-bb6f-0405b5987032	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
82aeecdd-bc8f-4fbd-b91e-0b0c40c78661	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3e1bd274-4570-4da8-b234-ec641068bb86	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
c635db90-3257-4010-bcae-2a73cf6221b2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	157b7924-7095-47da-8a70-9c71826083c6	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
921743b0-f32a-4b87-bf04-9675d38bf3c6	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d6ce58a8-9f9b-4d89-96ec-2541719f5032	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
504e0cca-cb9d-403c-ac48-041f091a9473	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	920f7ff8-6b17-45b1-b47b-fcbf48402a58	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
20c77a58-faf1-44ef-becc-e460c0dfecbe	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	79071461-9063-43ef-91f5-c2718a6fd1c5	3	4	\N	\N	f	\N
3e9eb56b-66ec-401c-8bc0-387fc030d390	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9ccdfbeb-fc62-4145-877d-a7229bee39e3	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	657be3d8-3910-4e25-a30d-db0b6f61551d	3	5	\N	\N	f	\N
cd1e1a78-7386-4ccf-b481-6749ea7e657c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2c6530f9-5a7c-4e22-aaba-b4ba2c4670b5	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	3	6	\N	\N	f	\N
7989f5e5-44bc-4048-b0d6-0d979d0a50c3	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9ccdfbeb-fc62-4145-877d-a7229bee39e3	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	4	1	\N	\N	f	\N
adf4ceda-a1f0-4f6b-8423-7aaa847e1307	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4f1ac017-0fc4-4588-8687-9923b4b77a29	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
ea89da1b-090a-4a4e-b142-c11a7aba5091	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
ee8f3da0-76eb-4a4a-8a23-b03302b8738f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	92deec47-1731-4087-bd9a-8e0d23be6e17	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
a4cad2ca-f83f-47e0-bd5c-662166b6cc7c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	00237f14-5738-4532-859c-32a61bb899cc	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
d4aa16a3-e6c3-46ba-b6c5-54161c951568	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	1a8df826-f304-4aca-9d68-5b850cb3b565	77aa3961-cda0-4580-b436-0098ac09239c	cbb37705-50ad-40a2-8a04-1938036cd5ee	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
099fc89f-2aab-45df-b6df-fbcc64261292	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fa0c723-8c64-42ab-9e66-ebe706f0b54b	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
5b60fbbe-53ea-4294-b9d1-e4cb363ef519	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3ed8086b-4e0c-437b-a2ff-14b3baec711b	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
b19f3491-ed0f-4f61-ba9a-3e68476b40dc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	8f6a8a45-b33a-4bec-a262-8225c7c2a2a6	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
0b0eabe5-e8b3-4da0-919c-e86ecf277cda	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	a4bfb527-4b4a-49d2-be23-3172961a59fe	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
c370ccbc-60a9-4a38-b74f-e34dc45dec19	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4911ab4c-0428-4238-bb6f-0405b5987032	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
73392044-f6e4-420a-9a48-ae9b3fbc0950	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5ca6ef80-8bee-49df-847e-d36707f8f9c4	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
419c6296-739c-4952-9b57-6905cbdd91c4	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	c0bf301a-4f36-4c0a-8983-5de3cf08eff7	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
e1986a4c-1838-43f3-9c6d-c661774cc9e5	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d6ce58a8-9f9b-4d89-96ec-2541719f5032	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
97fdef1a-fa9a-483e-98a8-257df1fe709e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5fcdfadc-b6c2-4ccc-9ac5-ddb9f086fd07	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
3b8d608d-90b6-4a67-b8e7-24ab77497c31	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3d7d77e0-6a1f-425b-a40f-126787eeaa27	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	657be3d8-3910-4e25-a30d-db0b6f61551d	1	4	\N	\N	f	\N
eefe84ac-6e44-4acb-ba6b-88936d3baff0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	12caa13f-49a0-449d-a877-5d616164605e	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	79071461-9063-43ef-91f5-c2718a6fd1c5	1	5	\N	\N	f	\N
36dacd30-e333-48d9-bdd5-82e5b09907c9	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f2a1aa37-1f9b-4f55-b15d-e61a58728281	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	1	6	\N	\N	f	\N
6375e1a9-f1c2-45b2-8ff6-6f9dff14287b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	2ec3ba97-f18e-442a-a770-cdc8a9ab30a4	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	2	1	\N	\N	f	\N
843888d0-8baa-43d4-b798-503b4631690b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	20ed771d-daec-425e-b0eb-98f72b2859d6	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	ff609222-11e0-46cc-a0fb-93c8efe3ab69	2	2	\N	\N	f	\N
ef5271f9-91c7-454a-a877-51f6d520aefc	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f9ab054b-5044-4d1f-adb2-1fd55b21654d	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	2	3	\N	\N	f	\N
b89241d7-0e98-48b0-8d91-6d6530e209c2	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6cd704bc-c6c5-44f2-8a22-b0a6a6e3d0b5	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	2	4	\N	\N	f	\N
d37a5e5c-6188-4fdd-8fe3-f17ebf7627aa	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	5d50e9da-9113-424b-9c0e-2c2f94a18cc2	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	2	5	\N	\N	f	\N
ff3dabff-c4f4-43db-b407-b01c670ebb33	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	e02a0a13-6e16-4a07-beab-2c2f31882d73	2	6	\N	\N	f	\N
e9b7d58c-9fe8-4d5b-ad9b-0661fc7fdea4	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	1a8df826-f304-4aca-9d68-5b850cb3b565	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	3	1	\N	\N	f	\N
a70f0902-d3c8-46ee-ae3b-d4a96df71ae7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	6bfd0788-e3db-4152-bccf-f55106aa245a	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	fb42081d-2f58-480e-8bb9-16ad9e2a8704	3	2	\N	\N	f	\N
440a5f88-0c34-454d-8982-be58a8c0358c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	fdbcf936-99d5-48b9-8410-eaa6a5b3b137	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	5f11e583-cebc-4eb3-b9df-8a18887fdb80	3	3	\N	\N	f	\N
76e27d39-2187-443c-b2a5-b0ae77673126	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4881abb1-a300-4491-b821-2425a5fe6fce	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	657be3d8-3910-4e25-a30d-db0b6f61551d	3	4	\N	\N	f	\N
37f8f1ec-93cd-4316-9dbe-65d5e93c90a7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	73acc6ac-66c5-4440-9974-c353c257783d	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	79071461-9063-43ef-91f5-c2718a6fd1c5	3	5	\N	\N	f	\N
d31665dc-e371-411c-a8c4-bfd287e5ea9b	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	bc3065dc-25e0-4370-8787-73a70187b735	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	f4d0cb93-a3f4-46c1-9794-0a33af1212ef	3	6	\N	\N	f	\N
05643f75-3666-482c-bb42-535a98cd27f7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	4	1	\N	\N	f	\N
ddb65551-89c1-4519-9e61-47ac5e1685f3	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	00237f14-5738-4532-859c-32a61bb899cc	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	ff609222-11e0-46cc-a0fb-93c8efe3ab69	4	2	\N	\N	f	\N
0eb547dc-3534-4ac4-a2bd-671fea6ddd94	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d6ce58a8-9f9b-4d89-96ec-2541719f5032	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	4	3	\N	\N	f	\N
e1808057-94fd-4b80-b020-2e371ec38ea8	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	9e2ae1cb-4b15-4ef3-b538-705de6a6ef8d	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	4	4	\N	\N	f	\N
26ea12e2-4f26-47f6-82bf-f1d2bed3e0aa	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3ed8086b-4e0c-437b-a2ff-14b3baec711b	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	4	5	\N	\N	f	\N
2ffb771d-6f26-4328-8b34-0f1ddb749ee8	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3e1bd274-4570-4da8-b234-ec641068bb86	205c8e11-2a8f-4477-971b-1146564b9a6c	270d357c-837a-43b5-9112-95f3273ca5d9	e02a0a13-6e16-4a07-beab-2c2f31882d73	4	6	\N	\N	f	\N
389320a8-0341-4d33-b520-b16edd266023	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	ba06d626-704c-409c-b8aa-71a5bc198ad2	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	e3d63d79-0fa4-4f0b-80a7-adfcb9093b25	0	1	\N	\N	f	\N
3e28ef2e-b208-4f77-857d-bdd1765024b7	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	4911ab4c-0428-4238-bb6f-0405b5987032	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	ff609222-11e0-46cc-a0fb-93c8efe3ab69	0	2	\N	\N	f	\N
c3555bb3-6e7e-4a15-90f6-57c4e348c4bf	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	f9ab054b-5044-4d1f-adb2-1fd55b21654d	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	2215053e-c7e9-4d6d-a098-0a5955c3e7ce	0	3	\N	\N	f	\N
518c9b31-75cf-4625-8614-3a482f517a9e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d3ff8de0-b63b-4612-a1c3-1529e0c35112	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	83c60ed5-d667-4aa7-a9aa-f28d4e2c6e63	0	4	\N	\N	f	\N
da21c320-4248-4224-b108-1494800f94e0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	3ed8086b-4e0c-437b-a2ff-14b3baec711b	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	f5d07e1e-4d9f-4e2b-a93c-e66b89d5d377	0	5	\N	\N	f	\N
5f29c7c9-8fc6-4abe-a3b6-10cd3be22b1f	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	d406fff7-e2b0-4d83-9b88-5db8eb93e9fe	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	e02a0a13-6e16-4a07-beab-2c2f31882d73	0	6	\N	\N	f	\N
e9c03095-edec-4fd8-a468-bee8fedb869e	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	92deec47-1731-4087-bd9a-8e0d23be6e17	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	23d73676-b6d0-4bcb-9625-59a5fbf5fb8c	1	1	\N	\N	f	\N
bf55eb04-a6b9-4fe6-a878-72e67adc60b0	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	157b7924-7095-47da-8a70-9c71826083c6	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	fb42081d-2f58-480e-8bb9-16ad9e2a8704	1	2	\N	\N	f	\N
0983b1f2-9e6d-4de8-bc4c-5ab9ae53fe6c	9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	87f63eb8-ce21-4dad-926a-4d44e223b162	bae28b43-93ff-466d-9a4b-5ca69badee99	95f682d6-631b-475a-b641-f368f24e6c33	5f11e583-cebc-4eb3-b9df-8a18887fdb80	1	3	\N	\N	f	\N
\.


--
-- Data for Name: timetable_versions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timetable_versions (id, school_id, published_by, published_at, is_active, data_snapshot) FROM stdin;
862f105b-46fb-45a8-9b01-37195ced4bcb	bbff2dac-3d7c-4ea0-8fc9-61af621a6d97	38f7d0ee-d0ea-46d5-b0cf-e95ceb67c641	2026-05-30 18:38:51.600175+00	f	{}
ba63c8a4-31d4-4e59-8ebe-1a59b89fd403	\N	\N	2026-05-30 15:29:25.504849+00	f	{}
7e72b212-4073-40db-a866-e67b8d729734	\N	\N	2026-05-30 15:29:36.440353+00	f	{}
9fb424aa-913a-49be-827d-37fa3fe83203	\N	\N	2026-05-30 15:32:21.312558+00	f	{}
515a2e2f-0481-4e17-ae0d-ddc4126840be	\N	\N	2026-05-30 15:33:04.197022+00	f	{}
566aa34f-4946-4bc3-b13b-3e8e3e1ee1b6	\N	\N	2026-05-30 15:36:38.877842+00	f	{}
0d4823d5-25f1-414b-8459-8a51006974f9	\N	\N	2026-05-30 15:38:49.56442+00	f	{}
e65337bd-0aac-4064-b109-a92b7df8dc2a	\N	\N	2026-05-30 15:42:59.555424+00	f	{}
99d5a143-8d8c-4762-870c-8a4d1ab9d0f9	\N	\N	2026-05-30 15:48:05.825946+00	f	{}
a7f39438-b6bf-423a-9ad8-02efc4074802	\N	\N	2026-05-30 15:48:21.172804+00	f	{}
1990f54d-0bde-493c-8524-b1a6e866c51e	\N	\N	2026-05-30 15:58:13.033895+00	f	{}
ca5f28e0-357f-4789-948d-8cbb04de15d0	\N	\N	2026-05-30 15:59:09.08534+00	f	{}
394f577f-265f-4910-98c5-415432720c51	\N	\N	2026-05-30 16:06:18.050555+00	f	{}
dbfd2539-a44c-443d-8db4-583903fd5677	\N	\N	2026-05-30 16:33:10.698314+00	f	{}
8b2477c7-625f-4a21-9161-8ef3c10dfd3d	4a150f72-29da-413a-b4e9-0784667ab560	\N	2026-05-30 22:24:52.633558+00	f	{}
46905e0a-16a6-4336-a79b-c41cd17b9925	4a8e5475-056f-46cb-b2f4-712f7eeb26ec	\N	2026-05-30 22:25:05.567794+00	f	{}
38cc339e-80f2-4b98-87b5-cfa74187111c	3d3b99d4-4828-4ff2-8060-d1ffe6daacd4	\N	2026-05-30 22:39:20.027816+00	f	{}
86dab453-6949-4e24-90bc-a9cabb41d16c	\N	\N	2026-05-31 00:43:27.511676+00	f	{}
a078946b-8e8e-4bfe-8788-0f9fe2db3647	\N	\N	2026-05-31 00:46:52.808648+00	f	{}
609bc207-5af6-403b-b534-c612ee384b19	\N	\N	2026-05-31 00:49:06.1234+00	f	{}
add2d416-ca55-4ea9-af30-5302c139a15e	\N	\N	2026-05-31 00:54:15.622451+00	f	{}
94db8df3-33b2-45de-952f-a2d5420f0bf3	\N	\N	2026-05-31 00:58:27.369475+00	f	{}
f75e7014-fe6b-4497-abbf-23a5239a99f7	\N	\N	2026-05-31 01:00:11.947042+00	f	{}
b7515bd7-2898-4d48-b744-a50b8b3ed6e5	\N	\N	2026-05-31 01:00:40.401516+00	f	{}
3706a024-f3bc-48b0-85e8-05e53f61c272	\N	\N	2026-05-31 01:03:33.125973+00	f	{}
095ac336-d850-439e-ab3d-80e5da7a7dae	\N	\N	2026-05-31 01:12:37.969718+00	f	{}
9a7b5bd5-69e1-43f7-a32a-552a8d072fb7	\N	\N	2026-05-31 01:23:53.17959+00	t	{}
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, college_id, email, password_hash, role, is_active, created_at, refresh_token, refresh_token_expires_at, is_verified, verification_token, verification_token_expires_at, reset_token, reset_token_expires_at) FROM stdin;
c3af7745-4978-484b-b2ce-9a4d5522890d	HOD002	hod.ad@schoolsync.com	$pbkdf2-sha256$29000$0rrXeo9RCqHUmpNSao0Rwg$xk9CmkCWORPGo.SQXIQ8qiXXcgUYSIINnqH/9LtY7s4	HOD	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
d17250a2-ba8e-4619-8c20-1e278c136d84	HOD003	hod.it@schoolsync.com	$pbkdf2-sha256$29000$KmXMmfM.x3hP6T1HqPWeMw$sDm0TNgNJ43aiztDevy74T.cfQ.5oKdkVv94hDh51Ck	HOD	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
97fdb72a-caa4-4bcd-be47-0fdf22a4900d	HOD004	hod.ec@schoolsync.com	$pbkdf2-sha256$29000$jlFKyVlLyZnTWuudk/IeQw$ZpcjHnt4iJcU1xGwB2opifNX94SV5MCXj7uPg5DerPY	HOD	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
59f338d8-c321-4163-84fd-8dfd70a030b6	TCH002	priya.menon@schoolsync.com	$pbkdf2-sha256$29000$OKcUYqxVipFSqjVmzHnPeQ$lmmeU9dC1MFT5/41wv.7mkivh.g5jUUFSzzzTOkkIQs	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
134dcab9-0f4a-4f82-bd81-4b236cd41f8b	TCH003	ravi.iyer@schoolsync.com	$pbkdf2-sha256$29000$f0/pXcs5h9A6hzAGoPTe2w$a8HDrnrOJnkXIfwnhGHp5wI7.IMvszP1CLOfrv3sD5U	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
0ddf943e-4536-43c8-b75f-f715552e7c9f	TCH004	arjun.nair@schoolsync.com	$pbkdf2-sha256$29000$W2vN2VuLUeo9p9RayxmjdA$aNjsmxR/.ZEiOdn9SdSTO5Rm.VjFi2gLyTj82eJRVhg	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
8c70090f-75b1-4925-9973-2d6b55f15d46	TCH005	lakshmi.rao@schoolsync.com	$pbkdf2-sha256$29000$wDiHsFZqzXkvhRDCOKdUCg$ngRy5BBZJpVMTZKFsHBl8MfdYilHb1G1FEDSTdTUXMw	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
2b3df31f-5588-410f-a743-4133a4113d4f	TCH006	fatima.khan@schoolsync.com	$pbkdf2-sha256$29000$cQ7h/H/v3XvvHUMoReidMw$fO4SuH6FgMn64qV4SwDzHE6bxgnQTph5uGIPjW6u/pw	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
8808dd5b-81fa-4c70-bb1b-9b71231f36b2	TCH007	george.mathew@schoolsync.com	$pbkdf2-sha256$29000$lhJirDXmHOPce.8dwxjD.A$wKdVpm4BNJOclLceZUVEdoCTeZwoYxCYVZU8PNNDbzU	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
a4c5d7a1-9b23-439a-9f85-7c0ddee40ea7	TCH008	sneha.varma@schoolsync.com	$pbkdf2-sha256$29000$CuEcwxhDKCXkvLcW4nyP0Q$niYU830gCXB.D9H7UAM2Ch1P97G5dDTBdgi.9i1o53c	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
6b755b45-302d-4229-b6c0-471384602967	TCH010	kiran.joseph@schoolsync.com	$pbkdf2-sha256$29000$GKPUeu.9l1LqXQshpNQ6pw$D2cxvjb4JeFPasnnOQAIpQ92lRA0HL5YcTUAiOh1uLo	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
9510a1da-6b81-4073-b6b1-4dc186669c50	TCH011	rahul.singh@schoolsync.com	$pbkdf2-sha256$29000$DIGQMqZ0Tsm5VwrhvBcCYA$OM27QPnPIXkqRusvsAfvNOBCikm/pxTZtriIKruAHAw	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
3e0241c1-53fa-4747-bb98-da15c34ec63b	CS_TCH013	anil.kapoor@schoolsync.com	$pbkdf2-sha256$29000$RCgF4JyztraWcs5ZC.G8Fw$nxCQY7k8ylX6u8AWbAuOWGCrOeZzZO8jgsV5o1iN5zA	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
6f49d040-83ff-4c89-bb4f-9fb6a1730389	CS_TCH015	rajat.sharma@schoolsync.com	$pbkdf2-sha256$29000$n1NqbY2xNkao9f6fM2ZsTQ$3fkmzQPQqwklEPu5L8Xv1p3jtdFKBTavkRkhduSx5kk	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
2d05a793-b5d8-49c9-ad2c-348744986fbb	CS_TCH016	neha.gupta@schoolsync.com	$pbkdf2-sha256$29000$ACCkdK5VqjVGiHGOUcoZow$BxzUCji1uqwfjImy2MR3MuALqWCE0BrgQhsHWb.IcZs	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
50cd2f04-0a0f-4136-8f50-666aa94797d5	CS_TCH017	vikram.chadha@schoolsync.com	$pbkdf2-sha256$29000$au1dC2EMgRBi7J1zzvk/Rw$6VXsZ4JB2XoKwLPi4I1KHHT1Zl.C7eNQWC.rjAwMz3c	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
eb08988d-062f-4e7c-baac-f9c4f4ef9ecb	CS_TCH018	aditya.kumar@schoolsync.com	$pbkdf2-sha256$29000$IQQgxLi3thbi3LuXsrY25g$047ykGzv41G3g4gNYALA0ldZXJUzkNs0Iaslw3vj0Kk	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
bb37354c-180e-44b6-8ec5-58b2595cbe2d	IT_TCH006	sonia.malhotra@schoolsync.com	$pbkdf2-sha256$29000$633vfc8Zo/TeW.udEyLEmA$3IqvceM9.ljkGFTRFMYVgFAz/MZmAaN5tBJPsV/9qqA	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
6ed09fa4-7624-4082-b2eb-7f9788e014d0	IT_TCH007	rajeev.kumar@schoolsync.com	$pbkdf2-sha256$29000$U6r1HiMkRCglJKSUEiKEUA$d4rKOMgb76uzgn3GfjyykgPDVKMJzIXS.kRbXUD14nU	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
24efee5d-78a5-4d61-a0e7-7f4ed40a471b	IT_TCH008	pallavi.joshi@schoolsync.com	$pbkdf2-sha256$29000$yhmjNCaE0DonBICQcg6hdA$EPdxAtWWmgpk7sXQLR0tCSuYprhwaPGQqa.eHzyhrlE	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
e9d8aeeb-d42e-4876-b704-ebc603bf99ca	IT_TCH009	manish.arora@schoolsync.com	$pbkdf2-sha256$29000$wzgnpHROSQlhbE0pBWAMQQ$haFDBfExgLHPPi2zwJ.OAV1TIbJY7BCIcXRf9QQdegA	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
72c020e3-3583-4372-af24-1d071059d240	IT_TCH010	swati.verma@schoolsync.com	$pbkdf2-sha256$29000$A2BM6V1rbY3xfm/Nec.ZMw$QrmQq/yVnEvK7renRL1BHaeX93lf61azxHVHIvdB9I0	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
06178d9d-0b8d-4125-9ad7-50b1ba6db3f8	IT_TCH011	varun.saxena@schoolsync.com	$pbkdf2-sha256$29000$15rTmrNWaq21VgphTOk95w$/U35ZmVJNDtt7.iUI.yGF7euAe8I0rKDEYIBmuQfcYk	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
74d78b52-5626-4a22-9b9b-4c7c3ae9de3c	AD_TCH003	sunita.rao@schoolsync.com	$pbkdf2-sha256$29000$XktpjbFWilEq5TxHCKF0zg$HtMgetVXNZuHqqmVWxHQODDBbAvwXIA3AhtOmjrdYzA	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
2bba04d8-3092-40d4-8402-e814f11d47d9	AD_TCH004	alok.srivastava@schoolsync.com	$pbkdf2-sha256$29000$9R4jJGSMcc455xzDGINwrg$r/k1aJtrManvhL6AQd7evrxqkv65ZRGQtCeCP3s2U0o	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
dac85f89-54c2-4927-b8ac-0a991920cdd8	EC_TCH007	ajay.nair@schoolsync.com	$pbkdf2-sha256$29000$1XrvPcdYK0UoxThHaM35Xw$sr0Wp1NhZTdkEZY7Yek61N5s6anyKY0O4RNOp74rQQM	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
ce23f969-fe1f-4888-b857-0fcc9c3ecabd	EC_TCH008	rekha.pillai@schoolsync.com	$pbkdf2-sha256$29000$qTWGEOK8l7L2nnMuRQgBQA$Gx3GTT2ig.Dr9NnfCQxhGh3Za3OceR1QXtzAhxLAu.M	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
7133f043-a2d4-4996-907e-171d4c4dfbf3	EC_TCH009	sanjay.mishra@schoolsync.com	$pbkdf2-sha256$29000$8n7v/Z9zDsG4N0aoda51zg$luWWqOGEOfAKuTKObm8u8FmCGNHSiRmRL75D2vq8QZc	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
0109d6f5-5722-44db-9daf-803783d416d2	EC_TCH010	nidhi.sharma@schoolsync.com	$pbkdf2-sha256$29000$pNQ6B2CsFYIQwriX0hpDCA$17oYTr4r8U18iSid54U9MSnfQ1ji92wl.5UOWzU9O.Q	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
7c112acb-d535-40da-9c2c-75ff6fb66329	EEE_TCH004	naveen.bansal@schoolsync.com	$pbkdf2-sha256$29000$ZsyZk3Iuxdibk9I65xyDMA$Mn/yE1RpHaRc.1KpjOePdFzDR3yfBDY3A5u6OkxUT0I	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
1d06e6f7-f62a-464a-b9ca-60fc61d7f8c6	EEE_TCH005	preeti.choudhary@schoolsync.com	$pbkdf2-sha256$29000$FWIsRYjR2nsvhXDuPYdQqg$5Dczspen8Ttc5GqdE3PNrHmkM/bM07O.66cy4FxjCNo	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
3ee08463-1c31-4a8b-926c-c3ee961f7448	CIVIL_TCH004	rajendra.prasad@schoolsync.com	$pbkdf2-sha256$29000$0dqb8z4nZMxZy/lf610rxQ$.ufpmtypw56Wokk5dfVIaRCIwd/u3UxpX7u716sHv68	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
dd88cdf0-d75c-47fb-aecd-49a8b4ec1390	CIVIL_TCH005	maya.das@schoolsync.com	$pbkdf2-sha256$29000$wFhrrZUS4lxLyfn/H4NQag$dw2fHDA.yABhi0mNZ8reXLBUbPI3xYszdW0LChyGg0I	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
ed37e2a4-691d-4f06-a53b-3dbdbe212ad4	MECH_TCH004	harish.kumar@schoolsync.com	$pbkdf2-sha256$29000$1to7h1CK8R7j/H/POccY4w$XEEKZ2buoDxZCyjooBsfMAo7XXEvJg6IhSwuA7mob.Q	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
4c0e16a7-ac9b-4b24-b432-fb034ab87124	TCH009	david.thomas@schoolsync.com	$pbkdf2-sha256$29000$j5FyLkUoBSAEYIzRes.Zkw$hlVU3lFiFBjSAwl9XyLEsxthWC3we58BRtO.WU6Wc60	HOD	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
9b1630e7-3779-47dc-9b34-0b3015cd551d	CS_TCH014	deepa.mehta@schoolsync.com	$pbkdf2-sha256$29000$IWTsXYtRyjmHEGJs7R3j3A$vVWzoHU1ZbdOphwQFfUHHhL1BH9m5MCe7Pe/wbWiypk	TEACHER	t	2026-05-30 18:38:34.668207+00	sMZunhoj5dxvn1oFZNkjA9YvVNEaiHdZqOGvLircMVOKm4HKsnGrDBihMtEodv1oZAMuyMJV_MgJmWrpP0v3JA	2026-06-06 22:09:09.818416+00	t	\N	\N	\N	\N
78692641-164c-49e4-bb89-8f9d8972e7cc	CS_TCH019	shreya.sinha@schoolsync.com	$pbkdf2-sha256$29000$GgOgtLa2lvL.n/N.DyFEKA$gLD2CyPnoOY/D4CpWu3.qkvHTXIQJoG/n3bZxLCHK1s	TEACHER	t	2026-05-30 18:38:34.668207+00	V9mjU_eGMh5XZIxXWkh5V1XukL8ttspk45xI6ESdY-UcN_ILH0q2dv6bdAMhp8mYGQOf6ntskVGy2Wa7aAYJEw	2026-06-06 23:58:27.752489+00	t	\N	\N	\N	\N
59d97ce4-ff79-46c4-8342-a94246a6cabe	MECH_TCH005	komal.singh@schoolsync.com	$pbkdf2-sha256$29000$Y4zRmpPS2vv/nxNC6F2L8Q$YQcyU0w5r4U/aTOhe2nrdtC3swQThEHz4/He39izso8	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
e3dc13fb-f7a6-440f-9e28-5d4c96a333b5	MECH_TCH006	ankit.bhatia@schoolsync.com	$pbkdf2-sha256$29000$cm7Nudd6D.Gc8957b41Rqg$ulwDv.XY63QYcSDZeZTRvieeqk3WJQHTqGOvSmSp35k	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
2f14b021-dcfc-40b6-8c3a-3bb36bd38eb2	AEI_TCH004	asha.nair@schoolsync.com	$pbkdf2-sha256$29000$sPa.l5KS8n7Pufe.lzImhA$QlpcVWjZ.g/PfPykuFw6o6r0FLGl0BUopSO3d/YwDH8	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
7c18a456-76de-434f-b442-81ea36f673a3	AEI_TCH005	ravi.verma@schoolsync.com	$pbkdf2-sha256$29000$/p/znvOeM.Yc43wv5TwnBA$/wqdPku66cOTscOI7ZNBh1gcjt4.C1T5Og9YoN5hOBQ	TEACHER	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
f9966766-17b9-4475-9d52-4457d9a78c6f	ADM001	admin@schoolsync.com	$pbkdf2-sha256$29000$SokRIoTwHkOotfb.v7eWcg$BZWe0FKYmfRM.zVxWYLbeoddhyEUr4vvNSCO3qQziVI	ADMIN	t	2026-05-30 18:38:34.668207+00	\N	\N	t	\N	\N	\N	\N
c20d0ab1-b998-43a8-9cc0-795b91965e26	HOD001	hod.cs@schoolsync.com	$pbkdf2-sha256$29000$hXAOoRSi1FoLYUxpLWXsfQ$KanvfAu7Qglj85nhW6FbPRWuTJL33cieMfeF4JAMuAw	HOD	t	2026-05-30 18:38:34.668207+00	evfM0fc9BsnoXqvz-NArT7jxYNYzSc7jk5boxZ4l6ofYry1MFCJxPVpuYbb9scUWS9ic-kAkBpCaBKx9sSLkWA	2026-06-07 02:32:32.935067+00	t	\N	\N	\N	\N
fa81cfec-48c8-48c1-aae4-6afd7e754738	TCH001	teacher@schoolsync.com	$pbkdf2-sha256$29000$TakVIkQoRQjBuJeythbCeA$AoCyQkGKIpZt0FsFKcJ5hWuY.FindcV4gOF2nsEzcmc	TEACHER	t	2026-05-30 18:38:34.668207+00	IieXolX8SS3-OOphgU-tB_us91GcjjoE3mag9S_TG61B9iwPZT7MDA9-PusWPliQD0jmD51hr9ZDTbCBoLYn4g	2026-06-07 03:19:32.680003+00	t	\N	\N	\N	\N
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-05-20 06:52:03
20211116045059	2026-05-20 06:52:04
20211116050929	2026-05-20 06:52:05
20211116051442	2026-05-20 06:52:06
20211116212300	2026-05-20 06:52:06
20211116213355	2026-05-20 06:52:07
20211116213934	2026-05-20 06:52:08
20211116214523	2026-05-20 06:52:09
20211122062447	2026-05-20 06:52:09
20211124070109	2026-05-20 06:52:10
20211202204204	2026-05-20 06:52:11
20211202204605	2026-05-20 06:52:11
20211210212804	2026-05-20 06:52:14
20211228014915	2026-05-20 06:52:14
20220107221237	2026-05-20 06:52:15
20220228202821	2026-05-20 06:52:16
20220312004840	2026-05-20 06:52:16
20220603231003	2026-05-20 06:52:17
20220603232444	2026-05-20 06:52:18
20220615214548	2026-05-20 06:52:19
20220712093339	2026-05-20 06:52:20
20220908172859	2026-05-20 06:52:20
20220916233421	2026-05-20 06:52:21
20230119133233	2026-05-20 06:52:22
20230128025114	2026-05-20 06:52:23
20230128025212	2026-05-20 06:52:23
20230227211149	2026-05-20 06:52:24
20230228184745	2026-05-20 06:52:25
20230308225145	2026-05-20 06:52:25
20230328144023	2026-05-20 06:52:26
20231018144023	2026-05-20 06:52:27
20231204144023	2026-05-20 06:52:28
20231204144024	2026-05-20 06:52:29
20231204144025	2026-05-20 06:52:29
20240108234812	2026-05-20 06:52:30
20240109165339	2026-05-20 06:52:31
20240227174441	2026-05-20 06:52:32
20240311171622	2026-05-20 06:52:33
20240321100241	2026-05-20 06:52:34
20240401105812	2026-05-20 06:52:36
20240418121054	2026-05-20 06:52:37
20240523004032	2026-05-20 06:52:39
20240618124746	2026-05-20 06:52:40
20240801235015	2026-05-20 06:52:41
20240805133720	2026-05-20 06:52:41
20240827160934	2026-05-20 06:52:42
20240919163303	2026-05-20 06:52:43
20240919163305	2026-05-20 06:52:44
20241019105805	2026-05-20 06:52:44
20241030150047	2026-05-20 06:52:47
20241108114728	2026-05-20 06:52:48
20241121104152	2026-05-20 06:52:49
20241130184212	2026-05-20 06:52:49
20241220035512	2026-05-20 06:52:50
20241220123912	2026-05-20 06:52:51
20241224161212	2026-05-20 06:52:51
20250107150512	2026-05-20 06:52:52
20250110162412	2026-05-20 06:52:53
20250123174212	2026-05-20 06:52:54
20250128220012	2026-05-20 06:52:54
20250506224012	2026-05-20 06:52:55
20250523164012	2026-05-20 06:52:55
20250714121412	2026-05-20 06:52:56
20250905041441	2026-05-20 06:52:57
20251103001201	2026-05-20 06:52:57
20251120212548	2026-05-20 06:52:58
20251120215549	2026-05-20 06:52:59
20260218120000	2026-05-20 06:53:00
20260326120000	2026-05-20 06:53:01
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-05-20 01:57:50.763101
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-05-20 01:57:50.800883
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-05-20 01:57:50.8059
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-05-20 01:57:50.831486
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-05-20 01:57:50.846894
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-05-20 01:57:50.85081
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-05-20 01:57:50.85811
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-05-20 01:57:50.862974
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-05-20 01:57:50.867363
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-05-20 01:57:50.871617
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-05-20 01:57:50.8766
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-05-20 01:57:50.882415
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-05-20 01:57:50.886914
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-05-20 01:57:50.890905
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-05-20 01:57:50.895172
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-05-20 01:57:50.924696
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-05-20 01:57:50.928696
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-05-20 01:57:50.932603
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-05-20 01:57:50.936835
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-05-20 01:57:50.942576
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-05-20 01:57:50.947035
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-05-20 01:57:50.952446
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-05-20 01:57:50.96541
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-05-20 01:57:50.974631
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-05-20 01:57:50.978751
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-05-20 01:57:50.982875
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-05-20 01:57:50.986746
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-05-20 01:57:50.991125
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-05-20 01:57:50.99515
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-05-20 01:57:50.999116
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-05-20 01:57:51.002877
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-05-20 01:57:51.006605
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-05-20 01:57:51.010218
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-05-20 01:57:51.013942
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-05-20 01:57:51.01787
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-05-20 01:57:51.021604
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-05-20 01:57:51.025152
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-05-20 01:57:51.029014
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-05-20 01:57:51.033278
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-05-20 01:57:51.044905
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-05-20 01:57:51.048906
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-05-20 01:57:51.052599
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-05-20 01:57:51.057152
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-05-20 01:57:51.061501
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-05-20 01:57:51.06689
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-05-20 01:57:51.074568
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-05-20 01:57:51.087091
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-05-20 01:57:51.091463
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-05-20 01:57:51.095272
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-05-20 01:57:51.114628
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-05-20 01:57:51.11933
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-05-20 01:57:51.195595
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-05-20 01:57:51.19751
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-05-20 01:57:51.20573
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-05-20 01:57:51.20873
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-05-20 01:57:51.210342
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-05-20 01:57:51.214999
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-05-20 01:57:51.220901
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-05-20 01:57:51.225077
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-05-20 01:57:51.230031
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-05-20 01:57:51.234214
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: absences absences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT absences_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: blocked_slots blocked_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_slots
    ADD CONSTRAINT blocked_slots_pkey PRIMARY KEY (id);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: department_subjects department_subjects_department_id_subject_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_subjects
    ADD CONSTRAINT department_subjects_department_id_subject_id_key UNIQUE (department_id, subject_id);


--
-- Name: department_subjects department_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_subjects
    ADD CONSTRAINT department_subjects_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: relief_assignments relief_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relief_assignments
    ADD CONSTRAINT relief_assignments_pkey PRIMARY KEY (id);


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: teacher_leave_balances teacher_leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_leave_balances
    ADD CONSTRAINT teacher_leave_balances_pkey PRIMARY KEY (id);


--
-- Name: teacher_leave_balances teacher_leave_balances_teacher_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_leave_balances
    ADD CONSTRAINT teacher_leave_balances_teacher_id_key UNIQUE (teacher_id);


--
-- Name: teacher_subjects teacher_subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_subjects
    ADD CONSTRAINT teacher_subjects_pkey PRIMARY KEY (id);


--
-- Name: teacher_subjects teacher_subjects_teacher_id_subject_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_subjects
    ADD CONSTRAINT teacher_subjects_teacher_id_subject_id_key UNIQUE (teacher_id, subject_id);


--
-- Name: teachers teachers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_email_key UNIQUE (email);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_key UNIQUE (user_id);


--
-- Name: timetable_slots timetable_slots_class_id_day_of_week_period_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_class_id_day_of_week_period_key UNIQUE (class_id, day_of_week, period);


--
-- Name: timetable_slots timetable_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_pkey PRIMARY KEY (id);


--
-- Name: timetable_slots timetable_slots_room_id_day_of_week_period_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_room_id_day_of_week_period_key UNIQUE (room_id, day_of_week, period);


--
-- Name: timetable_slots timetable_slots_teacher_id_day_of_week_period_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_teacher_id_day_of_week_period_key UNIQUE (teacher_id, day_of_week, period);


--
-- Name: timetable_versions timetable_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_versions
    ADD CONSTRAINT timetable_versions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: ix_blocked_slots_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_blocked_slots_id ON public.blocked_slots USING btree (id);


--
-- Name: ix_users_college_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_college_id ON public.users USING btree (college_id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_key ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: absences absences_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.absences
    ADD CONSTRAINT absences_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: audit_logs audit_logs_performed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_performed_by_user_id_fkey FOREIGN KEY (performed_by_user_id) REFERENCES public.users(id);


--
-- Name: blocked_slots blocked_slots_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocked_slots
    ADD CONSTRAINT blocked_slots_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: department_subjects department_subjects_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_subjects
    ADD CONSTRAINT department_subjects_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: department_subjects department_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.department_subjects
    ADD CONSTRAINT department_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: departments departments_hod_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_hod_id_fkey FOREIGN KEY (hod_id) REFERENCES public.teachers(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: relief_assignments relief_assignments_absence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relief_assignments
    ADD CONSTRAINT relief_assignments_absence_id_fkey FOREIGN KEY (absence_id) REFERENCES public.absences(id);


--
-- Name: relief_assignments relief_assignments_relief_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relief_assignments
    ADD CONSTRAINT relief_assignments_relief_teacher_id_fkey FOREIGN KEY (relief_teacher_id) REFERENCES public.teachers(id);


--
-- Name: relief_assignments relief_assignments_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relief_assignments
    ADD CONSTRAINT relief_assignments_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.timetable_slots(id);


--
-- Name: relief_assignments relief_assignments_swapped_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.relief_assignments
    ADD CONSTRAINT relief_assignments_swapped_slot_id_fkey FOREIGN KEY (swapped_slot_id) REFERENCES public.timetable_slots(id);


--
-- Name: subjects subjects_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: teacher_leave_balances teacher_leave_balances_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_leave_balances
    ADD CONSTRAINT teacher_leave_balances_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: teacher_subjects teacher_subjects_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_subjects
    ADD CONSTRAINT teacher_subjects_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: teacher_subjects teacher_subjects_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_subjects
    ADD CONSTRAINT teacher_subjects_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: teachers teachers_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: teachers teachers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: timetable_slots timetable_slots_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id);


--
-- Name: timetable_slots timetable_slots_original_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_original_teacher_id_fkey FOREIGN KEY (original_teacher_id) REFERENCES public.teachers(id);


--
-- Name: timetable_slots timetable_slots_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- Name: timetable_slots timetable_slots_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id);


--
-- Name: timetable_slots timetable_slots_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id);


--
-- Name: timetable_slots timetable_slots_timetable_version_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_slots
    ADD CONSTRAINT timetable_slots_timetable_version_id_fkey FOREIGN KEY (timetable_version_id) REFERENCES public.timetable_versions(id);


--
-- Name: timetable_versions timetable_versions_published_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable_versions
    ADD CONSTRAINT timetable_versions_published_by_fkey FOREIGN KEY (published_by) REFERENCES public.teachers(id);


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict 8iSgCyZSetiB1Ua5OSCs603ylmEgKnC1kyouWe2em6T4mEmVM2T6fLI9whk7sR9

