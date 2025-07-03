export const categories = [
  { value: "고정비", label: "고정비" },
  { value: "변동비", label: "변동비" },
  { value: "프로젝트", label: "프로젝트" },
  { value: "기타", label: "기타" },
]

export const expenseStatuses = [
  { value: "대기중", label: "대기중" },
  { value: "지불완료", label: "지불완료" },
  { value: "취소됨", label: "취소됨" },
]

export const siteCategories = [
  { value: "스트리밍", label: "스트리밍" },
  { value: "오디오", label: "오디오" },
  { value: "디자인", label: "디자인", subcategories: [
    { value: "그래픽", label: "그래픽" },
    { value: "UI/UX", label: "UI/UX" },
    { value: "3D", label: "3D" },
  ]},
  { value: "생산성", label: "생산성" },
  { value: "개발", label: "개발", subcategories: [
    { value: "프론트엔드", label: "프론트엔드" },
    { value: "백엔드", label: "백엔드" },
    { value: "모바일", label: "모바일" },
    { value: "데이터베이스", label: "데이터베이스" },
  ]},
  { value: "게임", label: "게임" },
  { value: "기타", label: "기타" },
];
