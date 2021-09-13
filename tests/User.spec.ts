import UserComponent from '@/components/User.vue';
import WrapperBuilder from './support/WrapperBuilder';

const createWrapperBuilder = () => {
  const defaults: any = {
    propsData: { userId: 0 },

    provide: {
      favoriteService: { save: jest.fn() },
      userService: {
        findById: jest.fn().mockReturnValue({ firstname: 'John', lastname: 'Doe' }),
      },
    },
  };

  return new WrapperBuilder<UserComponent>(UserComponent, defaults);
};

describe('User', () => {
  it('should instantiate a User component', () => {
    const wrapperBuilder = createWrapperBuilder();
    const wrapper = wrapperBuilder.build();

    expect(wrapper.exists()).toBeTruthy();
  });

  it('should find a user by its id', () => {
    const userService = { findById: jest.fn().mockReturnValue({}) };
    const propsData = { userId: 12345 };
    const params = { propsData, provide: { userService } };

    const wrapperBuilder = createWrapperBuilder();
    wrapperBuilder.buildWith(params);

    expect(userService.findById).toHaveBeenCalledWith(12345);
  });

  it('should save a user as a favorite', () => {
    const userService = { findById: jest.fn().mockReturnValueOnce('Fake user') };
    const favoriteService = { save: jest.fn() };
    const params = { provide: { userService, favoriteService } };

    const wrapperBuilder = createWrapperBuilder();
    const wrapper = wrapperBuilder.buildWith(params);

    const buttonWrapper = wrapper.find('button');
    buttonWrapper.trigger('click');

    expect(favoriteService.save).toHaveBeenCalledTimes(1);
    expect(favoriteService.save).toHaveBeenCalledWith('Fake user');
    expect(wrapper.emitted('saved')).toBeTruthy();
  });

  it('should display a greeting message', () => {
    const data = () => ({ greetingMessage: 'Greetings' });

    const wrapperBuilder = createWrapperBuilder();
    const wrapper = wrapperBuilder.buildWith({ data });

    expect(wrapper.text()).toContain('Greetings');
  });
});
