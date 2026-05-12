-- drizzle/0006_rename_slide_types.sql

-- 1. Rename slide type names in the slide_types table
UPDATE slide_types SET name = 'cover'            WHERE name = 'title'      AND scope = 'global';
UPDATE slide_types SET name = 'bullet-list'      WHERE name = 'content'    AND scope = 'global';
UPDATE slide_types SET name = 'numbered-list'    WHERE name = 'principles' AND scope = 'global';
UPDATE slide_types SET name = 'column-list'      WHERE name = 'values'     AND scope = 'global';
UPDATE slide_types SET name = 'callout-content'  WHERE name = 'reserve'    AND scope = 'global';
UPDATE slide_types SET name = 'card-grid'        WHERE name = 'purposes'   AND scope = 'global';
UPDATE slide_types SET name = 'divider'          WHERE name = 'section'    AND scope = 'global';
UPDATE slide_types SET name = 'team-cards'       WHERE name = 'ownership'  AND scope = 'global';
UPDATE slide_types SET name = 'comparison'       WHERE name = 'friction'   AND scope = 'global';
UPDATE slide_types SET name = 'qa-list'          WHERE name = 'discussion' AND scope = 'global';

-- 2. Rename type_name on existing slides
UPDATE slides SET type_name = 'cover'            WHERE type_name = 'title';
UPDATE slides SET type_name = 'bullet-list'      WHERE type_name = 'content';
UPDATE slides SET type_name = 'numbered-list'    WHERE type_name = 'principles';
UPDATE slides SET type_name = 'column-list'      WHERE type_name = 'values';
UPDATE slides SET type_name = 'callout-content'  WHERE type_name = 'reserve';
UPDATE slides SET type_name = 'card-grid'        WHERE type_name = 'purposes';
UPDATE slides SET type_name = 'divider'          WHERE type_name = 'section';
UPDATE slides SET type_name = 'team-cards'       WHERE type_name = 'ownership';
UPDATE slides SET type_name = 'comparison'       WHERE type_name = 'friction';
UPDATE slides SET type_name = 'qa-list'          WHERE type_name = 'discussion';
