import UserComponent from '@/components/User.vue';
import WrapperBuilder from './support/WrapperBuilder';

const createWrapper = (params?: Partial<Record<keyof WrapperBuilder<UserComponent>, any>>) => {
  const defaults: any = {
    propsData: { userId: 0 },

    provide: {
      favoriteService: { save: jest.fn() },
      userService: {
        findById: jest.fn().mockReturnValue({ firstname: 'John', lastname: 'Doe' }),
      },
    },
  };

  const wrapperBuilder = new WrapperBuilder<UserComponent>(UserComponent, defaults);
  return wrapperBuilder.build(params);
};

describe('User', () => {
  it('should instantiate a User component', () => {
    const wrapper = createWrapper();

    expect(wrapper.exists()).toBeTruthy();
  });

  it('should find a user by its id', () => {
    const userService = { findById: jest.fn().mockReturnValue({}) };
    const propsData = { userId: 12345 };
    const params = { propsData, provide: { userService } };

    createWrapper(params);

    expect(userService.findById).toHaveBeenCalledWith(12345);
  });

  it('should save a user as a favorite', () => {
    const userService = { findById: jest.fn().mockReturnValueOnce('Fake user') };
    const favoriteService = { save: jest.fn() };
    const params = { provide: { userService, favoriteService } };

    const wrapper = createWrapper(params);

    const buttonWrapper = wrapper.find('button');
    buttonWrapper.trigger('click');

    expect(favoriteService.save).toHaveBeenCalledTimes(1);
    expect(favoriteService.save).toHaveBeenCalledWith('Fake user');
    expect(wrapper.emitted('saved')).toBeTruthy();
  });

  it('should display a greeting message', () => {
    const data = () => ({ greetingMessage: 'Greetings' });

    const wrapper = createWrapper({ data });

    expect(wrapper.text()).toContain('Greetings');
  });
});
