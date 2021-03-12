import React from "react";
import { QWidget, FlexLayout } from "@nodegui/nodegui";
import { QDateTimeEdit, QDate, QTime } from "@nodegui/nodegui";

export const createDateWidget = (
  ref: React.RefObject<QWidget>,
  dateTimeChanged?: (text: string) => void
) => {
  if (!ref.current) {
    return;
  }
  const nowDate = new Date();
  const layout = new FlexLayout();
  ref.current.setLayout(layout);
  const dateTimeEdit = new QDateTimeEdit();
  dateTimeEdit.setDisplayFormat("yyyy-MM-dd hh:mm");
  const date = new QDate();
  date.setDate(2021, nowDate.getMonth() + 1, nowDate.getDate());
  const time = new QTime();
  time.setHMS(nowDate.getHours(), nowDate.getMinutes(), 0);
  dateTimeEdit.setDate(date);
  dateTimeEdit.setTime(time);
  dateTimeEdit.addEventListener("dateTimeChanged", () => {
    dateTimeChanged && dateTimeChanged(dateTimeEdit.text());
  });
  ref.current.layout?.addWidget(dateTimeEdit);
};
