import { plainToInstance } from 'class-transformer';
import { FilterBookDto } from './filter-book.dto';

describe('FilterBookDto — @Type transformations', () => {
  it('should transform string minPrice to a number', () => {
    const dto = plainToInstance(FilterBookDto, { minPrice: '10' });
    expect(typeof dto.minPrice).toBe('number');
    expect(dto.minPrice).toBe(10);
  });

  it('should transform string maxPrice to a number', () => {
    const dto = plainToInstance(FilterBookDto, { maxPrice: '100' });
    expect(typeof dto.maxPrice).toBe('number');
    expect(dto.maxPrice).toBe(100);
  });

  it('should transform string page to a number', () => {
    const dto = plainToInstance(FilterBookDto, { page: '3' });
    expect(typeof dto.page).toBe('number');
    expect(dto.page).toBe(3);
  });

  it('should transform string limit to a number', () => {
    const dto = plainToInstance(FilterBookDto, { limit: '25' });
    expect(typeof dto.limit).toBe('number');
    expect(dto.limit).toBe(25);
  });

  it('should apply default values when page and limit are not provided', () => {
    const dto = plainToInstance(FilterBookDto, {});
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  it('should keep all four numeric fields as-is when already numbers', () => {
    const dto = plainToInstance(FilterBookDto, {
      minPrice: 5,
      maxPrice: 200,
      page: 2,
      limit: 20,
    });
    expect(dto.minPrice).toBe(5);
    expect(dto.maxPrice).toBe(200);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
  });
});
