-- @tag: Termine02
-- @description: Tabelle Termine Start-Stop-Zeit in Timestamp 

--Starttag
CREATE SEQUENCE termine_id_seq;
ALTER TABLE termine ALTER id SET DEFAULT NEXTVAL('termine_id_seq');
