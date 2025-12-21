import React from 'react';

const HelpPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 prose prose-red">
      <h1>도움말</h1>
      
      <h3>이 앱은 무엇인가요?</h3>
      <p>
        유튜브에서 이미 100만 조회수를 넘긴 '끝난 영상'이 아니라, 
        <strong>업로드된 지 얼마 안 되었지만 반응 속도가 비정상적으로 빠른 '극초기' 영상</strong>을 찾아주는 도구입니다.
      </p>

      <h3>극초기 점수(Viral Score)란?</h3>
      <p>
        단순 조회수가 아니라 <strong>[시간당 조회수 증가량]</strong>과 <strong>[조회수 대비 좋아요 비율]</strong>을 
        종합하여 자체 계산한 점수입니다. 점수가 높을수록 현재 급상승 중일 확률이 높습니다.
      </p>

      <h3>검색 팁</h3>
      <ul>
        <li><strong>키워드</strong>: 너무 광범위한 키워드(예: 브이로그)보다는 구체적인 상황(예: 자취생 브이로그)이 좋습니다.</li>
        <li><strong>쇼츠 발굴</strong>: '24시간 이내' + '쇼츠' + '조회수 5천 이상' 조합이 가장 효과적입니다.</li>
        <li><strong>영상 개수</strong>: API 할당량을 아끼기 위해 처음에는 10개 정도로 설정해서 테스트하세요.</li>
      </ul>

      <h3>API 키 발급 방법</h3>
      <ol>
        <li><a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-red-600 underline">Google Cloud Console</a>에 접속합니다.</li>
        <li>새 프로젝트를 생성합니다.</li>
        <li>'API 및 서비스' > '라이브러리'에서 <strong>YouTube Data API v3</strong>를 검색하여 '사용'을 누릅니다.</li>
        <li>'사용자 인증 정보' > '사용자 인증 정보 만들기' > 'API 키'를 선택합니다.</li>
        <li>생성된 키를 복사하여 이 앱의 [설정] 메뉴에 입력합니다.</li>
      </ol>
    </div>
  );
};

export default HelpPage;