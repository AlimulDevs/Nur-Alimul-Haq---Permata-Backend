import { plainToInstance } from 'class-transformer';
import { CreateBookDto } from './create-book.dto';

describe('CreateBookDto — @Type transformations', () => {
  it('should transform string price to a number', () => {
    const dto = plainToInstance(CreateBookDto, {
      title: 'Harry Potter',
      authorId: 'c3d9a71e-0000-0000-0000-000000000001',
      isbn: '978-3-16-148410-0',
      price: '29.99',
      stock: '100',
    });

    expect(typeof dto.price).toBe('number');
    expect(dto.price).toBe(29.99);
  });

  it('should transform string stock to a number', () => {
    const dto = plainToInstance(CreateBookDto, {
      title: 'Harry Potter',
      authorId: 'c3d9a71e-0000-0000-0000-000000000001',
      isbn: '978-3-16-148410-0',
      price: '29.99',
      stock: '50',
    });

    expect(typeof dto.stock).toBe('number');
    expect(dto.stock).toBe(50);
  });

  it('should keep numeric price and stock as-is', () => {
    const dto = plainToInstance(CreateBookDto, {
      title: 'Clean Code',
      authorId: 'c3d9a71e-0000-0000-0000-000000000002',
      isbn: '978-0-13-235088-4',
      price: 49.99,
      stock: 10,
    });

    expect(dto.price).toBe(49.99);
    expect(dto.stock).toBe(10);
  });
});
