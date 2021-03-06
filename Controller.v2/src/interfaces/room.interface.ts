export interface IRoom {
  id: string;
  title: string;
  comfortTemp: number;
  emptyTemp: number;
  fritzId: string;
  createdFrom: string;
  createdFromId: string;
  eventColor: string;
  tempTime?: number;
  cooled?: boolean;
  heated?: boolean;
  hidden?: boolean;
}