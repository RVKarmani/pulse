CREATE TABLE source_data (
    data_ulid CHAR(26) NOT NULL PRIMARY KEY,
    source_name CHAR(3) NOT NULL,
    item_title TEXT NOT NULL,
    item_description TEXT NOT NULL
) with ('materialized' = 'true');

CREATE TABLE nodes (
    id VARCHAR(255) not null,
    data_ulid CHAR(26) NOT NULL,
    node_type VARCHAR(100) NOT NULL
) with ('materialized' = 'true');

CREATE TABLE relationships (
    source_id VARCHAR(255) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    rel_type VARCHAR(100) NOT NULL,
    data_ulid CHAR(26) NOT NULL
) with ('materialized' = 'true');


create materialized view graph_nodes (
    id,
    node_type
) as
    select id, node_type from nodes group by id, node_type;

create materialized view graph_relationships (
    source_id,
    target_id
) as
    select source_id, target_id from relationships group by source_id, target_id;

