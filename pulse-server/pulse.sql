CREATE TABLE source_lookup (
    source_shortcode CHAR(3) NOT NULL,
    source_name TEXT NOT NULL
) with ('materialized' = 'true');

CREATE TABLE source_data (
    source_shortcode CHAR(3) NOT NULL,
    item_title TEXT NOT NULL,
    item_description TEXT NOT NULL
) with ('materialized' = 'true');

CREATE TABLE nodes (
    id VARCHAR(255) not null,
    data_ulid CHAR(26) NOT NULL,
    node_type VARCHAR(100) NOT NULL
) with ('materialized' = 'true');

CREATE TABLE relationships (
    source_node_id VARCHAR(255) NOT NULL,
    target_node_id VARCHAR(255) NOT NULL,
    rel_type VARCHAR(100) NOT NULL,
    data_ulid CHAR(26) NOT NULL
) with ('materialized' = 'true');

-- Views
CREATE MATERIALIZED VIEW graph_nodes AS
SELECT DISTINCT
    id,
    node_type
FROM  nodes;

CREATE MATERIALIZED VIEW graph_relationships AS
SELECT DISTINCT 
    source_node_id AS source, 
    target_node_id AS target
FROM relationships;

CREATE MATERIALIZED VIEW source_summary AS
SELECT
    s.source_shortcode,
    s.source_name,
    COUNT(d.item_title) AS item_count
FROM
    source_lookup s
LEFT JOIN
    source_data d
    ON s.source_shortcode = d.source_shortcode
GROUP BY
    s.source_shortcode,
    s.source_name;
