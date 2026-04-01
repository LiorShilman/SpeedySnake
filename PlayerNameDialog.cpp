// PlayerNameDialog.cpp : implementation file
//

#include "stdafx.h"
#include "BoardSpeedySnake.h"
#include "PlayerNameDialog.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// CPlayerNameDialog dialog


CPlayerNameDialog::CPlayerNameDialog(CWnd* pParent /*=NULL*/)
	: CDialog(CPlayerNameDialog::IDD, pParent)
{
	//{{AFX_DATA_INIT(CPlayerNameDialog)
	m_strLavel = _T("");
	m_strRama = _T("");
	m_strScore = _T("");
	m_strSpeed = _T("");
	m_strName = _T("");
	//}}AFX_DATA_INIT
}


void CPlayerNameDialog::DoDataExchange(CDataExchange* pDX)
{
	CDialog::DoDataExchange(pDX);
	//{{AFX_DATA_MAP(CPlayerNameDialog)
	DDX_Text(pDX, IDC_LAVEL, m_strLavel);
	DDX_Text(pDX, IDC_RAMA, m_strRama);
	DDX_Text(pDX, IDC_SCORE, m_strScore);
	DDX_Text(pDX, IDC_SPEED, m_strSpeed);
	DDX_Text(pDX, IDC_NAME, m_strName);
	//}}AFX_DATA_MAP
}


BEGIN_MESSAGE_MAP(CPlayerNameDialog, CDialog)
	//{{AFX_MSG_MAP(CPlayerNameDialog)
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// CPlayerNameDialog message handlers

BOOL CPlayerNameDialog::OnInitDialog() 
{
	CDialog::OnInitDialog();
	
	// TODO: Add extra initialization here
	
	return TRUE;  // return TRUE unless you set the focus to a control
	              // EXCEPTION: OCX Property Pages should return FALSE
}

void CPlayerNameDialog::OnOK() 
{
	// TODO: Add extra validation here
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

	HKEY Software, Game , Rama;
	
	UpdateData(true);

	dwError = RegOpenKeyEx(HKEY_LOCAL_MACHINE,_T("Software"),0,KEY_QUERY_VALUE,&Software);
	dwError = RegOpenKeyEx(Software,_T("Game Lior"),0,KEY_QUERY_VALUE,&Game);

	if (m_strRama == "1")
		dwError = RegOpenKeyEx(Game,_T("Rama1"),0,KEY_QUERY_VALUE,&Rama);
	else if (m_strRama == "2")
		dwError = RegOpenKeyEx(Game,_T("Rama2"),0,KEY_QUERY_VALUE,&Rama);
	else
		dwError = RegOpenKeyEx(Game,_T("Rama3"),0,KEY_QUERY_VALUE,&Rama);

	regSize = 50;
	dwError = RegQueryValueEx(Rama,Speed,0,&regType,(LPBYTE)strSpeed,&regSize);
	regSize = 50;
	dwError = RegQueryValueEx(Rama,Lavel,0,&regType,(LPBYTE)strLavel,&regSize);
	regSize = 50;
	dwError = RegQueryValueEx(Rama,Score,0,&regType,(LPBYTE)strScore,&regSize);
	regSize = 50;	
	dwError = RegQueryValueEx(Rama,Name ,0,&regType,(LPBYTE)strName ,&regSize);

	RegCloseKey(Rama);
	RegCloseKey(Game);
	RegCloseKey(Software);
	
	CString Reg;
	Reg.Format("%s%c",Reg,(LPBYTE)strSpeed);
	Reg.Format("%s%c",Reg,(LPBYTE)strLavel);

	CString NewReg;
	NewReg += m_strSpeed;
	NewReg += m_strLavel;

	if (NewReg >= Reg)
	{
		CString RegScore;
		int nReg;
		int nNewReg;

		RegScore.Format("%s%c",RegScore,(LPBYTE)strScore);

		sscanf(RegScore.GetBuffer(0),"%d",&nReg);
		sscanf(m_strScore.GetBuffer(0),"%d",&nNewReg);

		if (nNewReg > nReg)
		{
			DWORD dwError;

			HKEY Software, Game;
	
			dwError = RegOpenKeyEx(HKEY_LOCAL_MACHINE,_T("Software"),0,KEY_SET_VALUE,&Software);
			dwError = RegOpenKeyEx(Software,_T("Game Lior"),0,KEY_SET_VALUE,&Game);

			if (m_strRama == "1")
				dwError = RegOpenKeyEx(Game,_T("Rama1"),0,KEY_SET_VALUE,&Rama);
			else if (m_strRama == "2")
				dwError = RegOpenKeyEx(Game,_T("Rama3"),0,KEY_SET_VALUE,&Rama);
			else
				dwError = RegOpenKeyEx(Game,_T("Rama3"),0,KEY_SET_VALUE,&Rama);
			
			regSize = 50;
			
			dwError = RegSetValueEx(Rama, Speed,0, REG_SZ , (const BYTE*) m_strSpeed.GetBuffer(0), regSize);

			dwError = RegSetValueEx(Rama, Lavel,0, REG_SZ , (const BYTE*) m_strLavel.GetBuffer(0), regSize);
	
			dwError = RegSetValueEx(Rama, Score,0, REG_SZ , (const BYTE*) m_strScore.GetBuffer(0), regSize);
		
			dwError = RegSetValueEx(Rama, Name ,0, REG_SZ , (const BYTE*) m_strName.GetBuffer(0), regSize);

			RegCloseKey(Rama);
			RegCloseKey(Game);
			RegCloseKey(Software);
		}
	}
	CDialog::OnOK();
}
