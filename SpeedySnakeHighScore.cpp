// SpeedySnakeHighScore.cpp : implementation file
//

#include "stdafx.h"
#include "BoardSpeedySnake.h"
#include "SpeedySnakeHighScore.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// SpeedySnakeHighScore dialog


SpeedySnakeHighScore::SpeedySnakeHighScore(CWnd* pParent /*=NULL*/)
	: CDialog(SpeedySnakeHighScore::IDD, pParent)
{
	//{{AFX_DATA_INIT(SpeedySnakeHighScore)
	m_strLavel1 = _T("");
	m_strLavel2 = _T("");
	m_strLavel3 = _T("");
	m_strName1 = _T("");
	m_strName2 = _T("");
	m_strName3 = _T("");
	m_strRama1 = _T("");
	m_strRama2 = _T("");
	m_strRama3 = _T("");
	m_strScore1 = _T("");
	m_strScore2 = _T("");
	m_strScore3 = _T("");
	m_strSpeed1 = _T("");
	m_strSpeed2 = _T("");
	m_strSpeed3 = _T("");
	//}}AFX_DATA_INIT
}


void SpeedySnakeHighScore::DoDataExchange(CDataExchange* pDX)
{
	CDialog::DoDataExchange(pDX);
	//{{AFX_DATA_MAP(SpeedySnakeHighScore)
	DDX_Text(pDX, IDC_LAVEL1, m_strLavel1);
	DDX_Text(pDX, IDC_LAVEL2, m_strLavel2);
	DDX_Text(pDX, IDC_LAVEL3, m_strLavel3);
	DDX_Text(pDX, IDC_NAME1, m_strName1);
	DDX_Text(pDX, IDC_NAME2, m_strName2);
	DDX_Text(pDX, IDC_NAME3, m_strName3);
	DDX_Text(pDX, IDC_RAMA1, m_strRama1);
	DDX_Text(pDX, IDC_RAMA2, m_strRama2);
	DDX_Text(pDX, IDC_RAMA3, m_strRama3);
	DDX_Text(pDX, IDC_SCORE1, m_strScore1);
	DDX_Text(pDX, IDC_SCORE2, m_strScore2);
	DDX_Text(pDX, IDC_SCORE3, m_strScore3);
	DDX_Text(pDX, IDC_SPEED1, m_strSpeed1);
	DDX_Text(pDX, IDC_SPEED2, m_strSpeed2);
	DDX_Text(pDX, IDC_SPEED3, m_strSpeed3);
	//}}AFX_DATA_MAP
}


BEGIN_MESSAGE_MAP(SpeedySnakeHighScore, CDialog)
	//{{AFX_MSG_MAP(SpeedySnakeHighScore)
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// SpeedySnakeHighScore message handlers

BOOL SpeedySnakeHighScore::OnInitDialog() 
{
	CDialog::OnInitDialog();
	
	// TODO: Add extra initialization here
	TCHAR strSpeed[50];
	TCHAR strName[50];
	TCHAR strLavel[50];
	TCHAR strScore[50];

	LPTSTR  Speed	= "Speed"; 
	LPTSTR  Name	= "Name"; 
	LPTSTR  Lavel	= "Lavel"; 
	LPTSTR  Score	= "Score"; 

	DWORD regType;
	DWORD regSize;
	DWORD dwError;

	HKEY Software, Game,Rama1,Rama2,Rama3;
	
	dwError = RegOpenKeyEx(HKEY_LOCAL_MACHINE,_T("Software"),0,KEY_QUERY_VALUE,&Software);
	dwError = RegOpenKeyEx(Software,_T("Game Lior"),0,KEY_QUERY_VALUE,&Game);
	dwError = RegOpenKeyEx(Game,_T("Rama1"),0,KEY_QUERY_VALUE,&Rama1);

	regSize = 50;
	dwError = RegQueryValueEx(Rama1,Speed,0,&regType,(LPBYTE)strSpeed,&regSize);
	regSize = 50;
	dwError = RegQueryValueEx(Rama1,Lavel,0,&regType,(LPBYTE)strLavel,&regSize);
	regSize = 50;
	dwError = RegQueryValueEx(Rama1,Score,0,&regType,(LPBYTE)strScore,&regSize);
	regSize = 50;	
	dwError = RegQueryValueEx(Rama1,Name ,0,&regType,(LPBYTE)strName ,&regSize);

	RegCloseKey(Rama1);
	
	m_strLavel1	= strLavel;
	m_strSpeed1	= strSpeed;
	m_strScore1	= strScore;
	m_strName1	= strName;
	m_strRama1	= "1";

	dwError = RegOpenKeyEx(Game,_T("Rama2"),0,KEY_QUERY_VALUE,&Rama2);

	regSize = 50;
	dwError = RegQueryValueEx(Rama2,Speed,0,&regType,(LPBYTE)strSpeed,&regSize);
	regSize = 50;
	dwError = RegQueryValueEx(Rama2,Lavel,0,&regType,(LPBYTE)strLavel,&regSize);
	regSize = 50;
	dwError = RegQueryValueEx(Rama2,Score,0,&regType,(LPBYTE)strScore,&regSize);
	regSize = 50;	
	dwError = RegQueryValueEx(Rama2,Name ,0,&regType,(LPBYTE)strName ,&regSize);

	RegCloseKey(Rama2);
	
	m_strLavel2	= strLavel;
	m_strSpeed2	= strSpeed;
	m_strScore2	= strScore;
	m_strName2	= strName;
	m_strRama2	= "2";
	dwError = RegOpenKeyEx(Game,_T("Rama3"),0,KEY_QUERY_VALUE,&Rama3);

	regSize = 50;
	dwError = RegQueryValueEx(Rama3,Speed,0,&regType,(LPBYTE)strSpeed,&regSize);
	regSize = 50;
	dwError = RegQueryValueEx(Rama3,Lavel,0,&regType,(LPBYTE)strLavel,&regSize);
	regSize = 50;
	dwError = RegQueryValueEx(Rama3,Score,0,&regType,(LPBYTE)strScore,&regSize);
	regSize = 50;	
	dwError = RegQueryValueEx(Rama3,Name ,0,&regType,(LPBYTE)strName ,&regSize);

	RegCloseKey(Rama3);
	
	m_strLavel3	= strLavel;
	m_strSpeed3	= strSpeed;
	m_strScore3	= strScore;
	m_strName3	= strName;
	m_strRama3	= "3";

	RegCloseKey(Game);
	RegCloseKey(Software);	

	UpdateData(false);
	return TRUE;  // return TRUE unless you set the focus to a control
	              // EXCEPTION: OCX Property Pages should return FALSE
}
