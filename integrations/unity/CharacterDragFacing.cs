using UnityEngine;
using UnityEngine.UI;
using UnityEngine.EventSystems;

/// <summary>
/// 코디 캐릭터를 끌어서 바라보는 방향을 바꿉니다.
/// EventSystem 포인터 이벤트를 사용하므로 터치와 마우스 입력을 함께 지원합니다.
/// 그림 자체를 Z축으로 돌리지 않고, 해당 각도의 스프라이트를 선택합니다.
/// </summary>
public sealed class CharacterDragFacing : MonoBehaviour,
    IPointerDownHandler, IBeginDragHandler, IDragHandler, IEndDragHandler, IPointerUpHandler
{
    public enum DragMode { Direction, Orbit }

    [Header("표시 대상: UI Image 또는 SpriteRenderer 중 하나")]
    [SerializeField] private Image uiImage;
    [SerializeField] private SpriteRenderer spriteRenderer;

    [Header("정면부터 시계 방향으로 배치")]
    [Tooltip("4장: 정면, 오른쪽, 뒷면, 왼쪽. 8/16/32장도 같은 순서입니다.")]
    [SerializeField] private Sprite[] directionSprites;

    [Header("조작")]
    [Tooltip("Direction: 드래그 방향을 바라봄. Orbit: 좌우로 밀어 회전.")]
    [SerializeField] private DragMode mode = DragMode.Direction;
    [Tooltip("Orbit에서는 화면 너비당 회전량, Direction에서는 반응 속도에 적용됩니다.")]
    [Min(0.01f)] [SerializeField] private float sensitivity = 1f;
    [Tooltip("작은 손 떨림을 무시할 거리. 화면 짧은 변에 대한 비율입니다.")]
    [Range(0.001f, 0.1f)] [SerializeField] private float deadZone = 0.012f;
    [Tooltip("초당 최대 회전 각도. 값이 클수록 빠르게 따라옵니다.")]
    [Min(1f)] [SerializeField] private float turnSpeed = 720f;
    [SerializeField] private float initialAngle;

    public float Angle { get; private set; }
    private float targetAngle;
    private Vector2 startPosition;
    private float startAngle;
    private int? activePointer;
    private int lastIndex = -1;

    private void Awake()
    {
        Angle = targetAngle = Mathf.Repeat(initialAngle, 360f);
        if (uiImage == null) uiImage = GetComponent<Image>();
        if (spriteRenderer == null) spriteRenderer = GetComponent<SpriteRenderer>();
        if (directionSprites == null || directionSprites.Length == 0)
            Debug.LogWarning("CharacterDragFacing: 방향별 스프라이트를 등록해 주세요.", this);
        RefreshSprite();
    }

    private void Update()
    {
        // 359도에서 0도로 넘어갈 때도 가장 짧은 방향으로 이동합니다.
        // unscaledDeltaTime을 사용해 메뉴에서 timeScale=0이어도 작동합니다.
        Angle = Mathf.Repeat(Mathf.MoveTowardsAngle(Angle, targetAngle,
            turnSpeed * Mathf.Max(0.01f, sensitivity) * Time.unscaledDeltaTime), 360f);
        RefreshSprite();
    }

    public void OnPointerDown(PointerEventData eventData)
    {
        // 두 번째 손가락이나 오른쪽 마우스 버튼이 회전을 가로채지 않게 합니다.
        if (activePointer.HasValue || eventData.button != PointerEventData.InputButton.Left) return;
        activePointer = eventData.pointerId;
        startPosition = eventData.position;
        startAngle = targetAngle;
    }

    public void OnBeginDrag(PointerEventData eventData) { }

    public void OnDrag(PointerEventData eventData)
    {
        if (activePointer != eventData.pointerId) return;
        Vector2 delta = eventData.position - startPosition;
        float screenUnit = Mathf.Max(1f, Mathf.Min(Screen.width, Screen.height));
        if (delta.magnitude < deadZone * screenUnit) return;

        if (mode == DragMode.Direction)
        {
            // 화면 아래=정면0°, 오른쪽=90°, 위=뒷면180°, 왼쪽=270°.
            // 기준점에서 손가락이 향하는 방향을 각도로 변환합니다.
            targetAngle = Mathf.Repeat(Mathf.Atan2(delta.x, -delta.y) * Mathf.Rad2Deg, 360f);
        }
        else
        {
            // 화면 너비만큼 밀면 sensitivity=1일 때 한 바퀴 회전합니다.
            targetAngle = Mathf.Repeat(startAngle + delta.x / Mathf.Max(1f, Screen.width)
                * 360f * Mathf.Max(0.01f, sensitivity), 360f);
        }
    }

    public void OnEndDrag(PointerEventData eventData) { Release(eventData); }
    public void OnPointerUp(PointerEventData eventData) { Release(eventData); }
    private void Release(PointerEventData eventData)
    {
        if (activePointer == eventData.pointerId) activePointer = null;
    }

    private void OnDisable() { activePointer = null; }
    private void OnApplicationFocus(bool focused) { if (!focused) activePointer = null; }

    private void RefreshSprite()
    {
        if (directionSprites == null || directionSprites.Length == 0) return;
        float step = 360f / directionSprites.Length;
        int index = Mathf.FloorToInt((Angle + step * 0.5f) / step) % directionSprites.Length;
        if (index == lastIndex) return;
        Sprite next = directionSprites[index];
        if (next == null) return; // 누락된 방향은 마지막 유효한 이미지를 유지합니다.
        if (uiImage != null) uiImage.sprite = next;
        if (spriteRenderer != null) spriteRenderer.sprite = next;
        lastIndex = index;
    }
}
