import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { alias, sort, filterBy, notEmpty } from '@ember/object/computed';
import Ember from 'ember';

import ajax from '../../utils/ajax';

export default Controller.extend({
  // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
  tokenSort: ['created_at:desc'],

  sortedTokens: sort('model.api_tokens', 'tokenSort'),

  isResetting: false,

  ownedCrates: alias('model.ownedCrates'),

  newTokens: filterBy('model.api_tokens', 'isNew', true),
  disableCreate: notEmpty('newTokens'),

  emailNotificationsError: false,
  emailNotificationsSuccess: false,

  hasEmailNotificationFeature: computed(function () {
    return Ember.testing;
  }),

  setAllEmailNotifications(value) {
    this.get('ownedCrates').forEach(c => {
      c.set('email_notifications', value);
    });
  },

  actions: {
    async saveEmailNotifications() {
      try {
        await ajax(`/api/v1/me/email_notifications`, {
          method: 'PUT',
          body: JSON.stringify(
            this.get('ownedCrates').map(c => ({
              id: parseInt(c.id, 10),
              email_notifications: c.email_notifications,
            })),
          ),
        });
        this.setProperties({
          emailNotificationsError: false,
          emailNotificationsSuccess: true,
        });
      } catch (err) {
        console.error(err);
        this.setProperties({
          emailNotificationsError: true,
          emailNotificationsSuccess: false,
        });
      }
    },
    emailNotificationsSelectAll() {
      this.setAllEmailNotifications(true);
    },
    emailNotificationsSelectNone() {
      this.setAllEmailNotifications(false);
    },
    startNewToken() {
      this.store.createRecord('api-token', {
        created_at: new Date(Date.now() + 2000),
      });
    },
  },
});
