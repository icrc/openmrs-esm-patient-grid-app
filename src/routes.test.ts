import { RouteDescriptor } from './routes';

describe(RouteDescriptor, () => {
  it('correctly provides and interpolates route info', () => {
    const path = 'foo/:bar/baz';
    const descriptor = new RouteDescriptor<{ bar: string }>('foo/:bar/baz');
    const route = descriptor.interpolate({ bar: 'bar' });
    expect(descriptor.path).toBe(path);
    expect(route).toBe('foo/bar/baz');
  });
});
