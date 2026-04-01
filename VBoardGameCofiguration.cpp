// VBoardGameCofiguration.cpp : implementation file
//

#include "stdafx.h"
#include "BoardSpeedySnake.h"
#include "VBoardGameCofiguration.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

/////////////////////////////////////////////////////////////////////////////
// VBoardGameCofiguration dialog


VBoardGameCofiguration::VBoardGameCofiguration(CWnd* pParent /*=NULL*/)
	: CDialog(VBoardGameCofiguration::IDD, pParent)
{
	//{{AFX_DATA_INIT(VBoardGameCofiguration)
	m_nSpeed = 0;
	m_nLavel = -1;
	//}}AFX_DATA_INIT
}


void VBoardGameCofiguration::DoDataExchange(CDataExchange* pDX)
{
	CDialog::DoDataExchange(pDX);
	//{{AFX_DATA_MAP(VBoardGameCofiguration)
	DDX_Slider(pDX, IDC_SPEED, m_nSpeed);
	DDX_Radio(pDX, IDC_BEGINNER, m_nLavel);
	//}}AFX_DATA_MAP
}


BEGIN_MESSAGE_MAP(VBoardGameCofiguration, CDialog)
	//{{AFX_MSG_MAP(VBoardGameCofiguration)
	ON_WM_HSCROLL()
	ON_COMMAND(ID_FILE_NEW_GAME, OnFileNewGame)
	//}}AFX_MSG_MAP
END_MESSAGE_MAP()

/////////////////////////////////////////////////////////////////////////////
// VBoardGameCofiguration message handlers

BOOL VBoardGameCofiguration::OnInitDialog() 
{
	CDialog::OnInitDialog();
	
	// TODO: Add extra initialization here
	CheckRadioButton(IDC_BEGINNER,IDC_BEST,IDC_INTERMADIATE); // Init Lavel.

	CString strText;
	CSliderCtrl* pSlideSpeed = (CSliderCtrl*) GetDlgItem(IDC_SPEED);

	pSlideSpeed->SetRange(MINSPEED,MAXSPEED); // Init Range,Pos Of Speed.
	pSlideSpeed->SetPos(5);
	strText.Format("%d", pSlideSpeed->GetPos());
	SetDlgItemText(IDC_LABELSLIDER, strText);

	
	return TRUE;  // return TRUE unless you set the focus to a control
	              // EXCEPTION: OCX Property Pages should return FALSE
}

void VBoardGameCofiguration::OnHScroll(UINT nSBCode, UINT nPos, CScrollBar* pScrollBar) 
{
	// TODO: Add your message handler code here and/or call default
	CSliderCtrl* pSlideSpeed = (CSliderCtrl*) pScrollBar;
	CString strText;
	strText.Format("%d", pSlideSpeed->GetPos());
	SetDlgItemText(IDC_LABELSLIDER, strText);

	// Dialog::OnHScroll(nSBCode, nPos, pScrollBar);
}

void VBoardGameCofiguration::OnFileNewGame() 
{
	// TODO: Add your command handler code here

	
}
