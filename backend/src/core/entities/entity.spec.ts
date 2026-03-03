import { describe, it, expect } from 'vitest';
import { Entity } from './entity';

describe('Entity', () => {
	it('should create an entity with valid properties', () => {
		const entity = new Entity('Test', 1);
		expect(entity.name).toBe('Test');
		expect(entity.id).toBe(1);
	});

	it('should throw an error for invalid properties', () => {
		expect(() => new Entity('', -1)).toThrow();
	});
});