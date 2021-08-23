export interface IRoom {
  id: string;
  title: string;
  comfortTemp: number;
  emptyTemp: number;
  fritzId: string;
  createdFrom: string;
  createdFromId: string;
  eventColor: string;
}

export const HOLIDAY_MOCK_ROOM = {
  id: 'holidayMockRoom',
  title: 'Ferien',
  comfortTemp: 0,
  emptyTemp: 0,
  fritzId: '',
  createdFrom: '',
  createdFromId: '',
  eventColor: '#b1b1b1'
}